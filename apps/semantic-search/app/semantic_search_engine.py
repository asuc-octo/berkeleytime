import hashlib
import logging
import os
import threading
import time
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Iterable, List, Optional, Set, Tuple

import numpy as np
import requests
from pymongo import DeleteOne, MongoClient, ReplaceOne
from sentence_transformers import SentenceTransformer

from .generated_operations import SEMANTIC_SEARCH_OPERATION_IDS

logger = logging.getLogger("semantic-search")

# Semester order for comparison
SEMESTER_ORDER = {"Spring": 0, "Summer": 1, "Fall": 2, "Winter": 3}

# MongoDB connection — uses the same MONGODB_URI as the rest of the codebase
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://mongodb:27017/bt")

# Atlas Vector Search index name on the courseEmbeddings collection
VECTOR_SEARCH_INDEX_NAME = "course_embeddings_vector_search"

# Backend URL for fetching course catalog (configurable for K8s vs Docker)
BACKEND_INTERNAL_URL = os.getenv("BACKEND_URL", "http://backend:5001")
DEFAULT_CATALOG_URL = f"{BACKEND_INTERNAL_URL}/api/graphql"

# Semantic search embedding model options:
#   BAAI/bge-base-en-v1.5        (Current - best for retrieval, 109M params)
#   BAAI/bge-small-en-v1.5       (Faster, smaller, 33M params)
#   BAAI/bge-large-en-v1.5       (Most accurate, slower, 335M params)
#   sentence-transformers/all-mpnet-base-v2   (Good general purpose, 110M params)
#   sentence-transformers/all-MiniLM-L6-v2    (Fastest, lightweight, 22M params)
MODEL_NAME = "BAAI/bge-base-en-v1.5"
QUERY_PREFIX = "Represent this sentence for searching relevant passages: "
DEFAULT_YEAR_ENV = os.getenv("SEMANTIC_SEARCH_YEAR")
DEFAULT_SEMESTER_ENV = os.getenv("SEMANTIC_SEARCH_SEMESTER")
DEFAULT_ALLOWED_SUBJECTS = {
    token.strip().upper()
    for token in os.getenv("SEMANTIC_SEARCH_ALLOWED_SUBJECTS", "").split(",")
    if token.strip()
} or None


def resolve_default_term(year_value: Optional[str], semester_value: Optional[str]) -> Optional[Tuple[int, str]]:
    if year_value and semester_value:
        try:
            return int(year_value), semester_value.strip()
        except ValueError as exc:
            logger.error("Invalid default term configuration: %s", exc)
            return None

    if year_value or semester_value:
        logger.error("Both SEMANTIC_SEARCH_YEAR and SEMANTIC_SEARCH_SEMESTER are required to set a default term.")
    return None


DEFAULT_TERM = resolve_default_term(DEFAULT_YEAR_ENV, DEFAULT_SEMESTER_ENV)


@dataclass
class TermIndex:
    size: int
    last_refreshed: datetime
    year: int
    semester: str
    allowed_subjects: Optional[List[str]]


class SemanticSearchEngine:
    def __init__(self) -> None:
        self.model = SentenceTransformer(MODEL_NAME)
        self._embedding_dims = self.model.get_sentence_embedding_dimension()
        self.catalog_url = DEFAULT_CATALOG_URL
        self.default_allowed_subjects = set(DEFAULT_ALLOWED_SUBJECTS) if DEFAULT_ALLOWED_SUBJECTS else None
        self._indices: Dict[str, TermIndex] = {}
        self._lock = threading.RLock()
        self._building: Optional[str] = None
        self._build_started: Optional[datetime] = None
        self._last_error: Optional[str] = None
        self._build_thread: Optional[threading.Thread] = None
        self._build_queue: List[Tuple[int, str]] = []
        self._mongo_client = MongoClient(MONGODB_URI)
        self._embeddings_col = self._mongo_client.get_default_database()["courseEmbeddings"]

    def _key(self, year: int, semester: str) -> str:
        return f"{year}:{semester}"

    def _load_mongo_index(self, year: int, semester: str) -> Optional[TermIndex]:
        """Check if embeddings exist in MongoDB for this term and return metadata."""
        try:
            count = self._embeddings_col.count_documents({"year": year, "semester": semester})
            if count == 0:
                return None
            doc = self._embeddings_col.find_one(
                {"year": year, "semester": semester},
                sort=[("refreshedAt", -1)],
            )
            if not doc:
                return None
            entry = TermIndex(
                size=count,
                last_refreshed=doc["refreshedAt"],
                year=year,
                semester=semester,
                allowed_subjects=None,
            )
            logger.info("Loaded from MongoDB: %s %s (%d courses)", semester, year, count)
            return entry
        except Exception as exc:
            logger.warning("Failed to load index from MongoDB: %s", exc)
            return None

    def refresh(
        self, year: int, semester: str, allowed_subjects: Optional[Iterable[str]] = None
    ) -> TermIndex:
        term_semester = semester.strip()
        build_key = f"{term_semester} {year}"

        logger.info("Building index for %s %s", term_semester, year)

        self._building = build_key
        self._build_started = datetime.utcnow()
        try:
            raw_courses = self._fetch_courses(year, term_semester)
            courses = self._deduplicate_courses(raw_courses)
            if not courses:
                raise RuntimeError("Catalog response did not contain any courses")

            course_texts = [self._build_course_text(course) for course in courses]
            course_hashes = [self._hash_course_text(text) for text in course_texts]

            existing_hashes = self._load_existing_hashes(year, term_semester)

            changed_indices = []
            for i, course in enumerate(courses):
                course_id = course.get("courseNumber") or ""
                subject = course.get("subject") or ""
                if existing_hashes.get((subject, course_id)) != course_hashes[i]:
                    changed_indices.append(i)

            logger.info(
                "Incremental refresh: %d changed/new, %d unchanged (out of %d total)",
                len(changed_indices), len(courses) - len(changed_indices), len(courses),
            )

            refreshed_at = datetime.utcnow()
            ops = []

            if changed_indices:
                changed_texts = [course_texts[i] for i in changed_indices]
                logger.info("Encoding %d courses...", len(changed_texts))
                embeddings = np.asarray(
                    self.model.encode(changed_texts, batch_size=128, convert_to_numpy=True),
                    dtype="float32",
                )
                for rank, i in enumerate(changed_indices):
                    course = courses[i]
                    course_id = course.get("courseNumber") or ""
                    subject = course.get("subject") or ""
                    ops.append(ReplaceOne(
                        filter={
                            "courseId": course_id,
                            "subject": subject,
                            "year": year,
                            "semester": term_semester,
                        },
                        replacement={
                            "courseId": course_id,
                            "subject": subject,
                            "year": year,
                            "semester": term_semester,
                            "embedding": embeddings[rank].tolist(),
                            "refreshedAt": refreshed_at,
                            "contentHash": course_hashes[i],
                        },
                        upsert=True,
                    ))

            # Delete courses removed from catalog
            current_keys = {
                (course.get("subject") or "", course.get("courseNumber") or "")
                for course in courses
            }
            removed_keys = set(existing_hashes.keys()) - current_keys
            if removed_keys:
                logger.info("Removing %d courses no longer in catalog", len(removed_keys))
                self._embeddings_col.bulk_write(
                    [
                        DeleteOne({
                            "courseId": course_id,
                            "subject": subject,
                            "year": year,
                            "semester": term_semester,
                        })
                        for subject, course_id in removed_keys
                    ],
                    ordered=False,
                )

            if ops:
                self._embeddings_col.bulk_write(ops, ordered=False)

            entry = TermIndex(
                size=len(courses),
                last_refreshed=refreshed_at,
                year=year,
                semester=term_semester,
                allowed_subjects=None,
            )

            key = self._key(year, term_semester)
            with self._lock:
                self._indices[key] = entry

            self._evict_old_indexes()

            logger.info("Index ready: %s %s (%d courses)", term_semester, year, len(courses))
            return entry
        finally:
            self._building = None
            self._build_started = None

    def refresh_async(
        self, year: int, semester: str, allowed_subjects: Optional[Iterable[str]] = None
    ) -> Dict:
        """Start index refresh in background thread. Returns immediately with status."""
        term_semester = semester.strip()
        build_key = f"{term_semester} {year}"

        with self._lock:
            if self._building:
                return {
                    "status": "already_building",
                    "building": self._building,
                    "message": f"Already building index for {self._building}",
                }

            if self._build_thread and self._build_thread.is_alive():
                return {
                    "status": "already_building",
                    "building": self._building,
                    "message": "A build is already in progress",
                }

            self._last_error = None

            def build_in_background():
                try:
                    self.refresh(year, term_semester, allowed_subjects)
                except Exception as exc:
                    logger.exception("Background refresh failed: %s", exc)
                    self._last_error = str(exc)

            self._build_thread = threading.Thread(target=build_in_background, daemon=True)
            self._build_thread.start()

        return {
            "status": "building",
            "building": build_key,
            "message": f"Started building index for {build_key} in background",
        }

    def search(
        self,
        query: str,
        year: int,
        semester: str,
        threshold: float = 0.3,
        allowed_subjects: Optional[Iterable[str]] = None,
    ) -> Tuple[List[Dict], TermIndex]:
        entry = self._get_or_build_index(year, semester, allowed_subjects)

        search_k = min(entry.size, 50)
        if search_k == 0:
            return [], entry

        # BGE models work better with instruction prefix for queries
        prefixed_query = QUERY_PREFIX + query
        query_vec = np.asarray(self.model.encode([prefixed_query], convert_to_numpy=True), dtype="float32")[0]

        allowed = self._resolve_allowed_subjects(allowed_subjects)
        vs_filter: Dict = {"year": year, "semester": semester}
        if allowed:
            vs_filter["subject"] = {"$in": list(allowed)}

        num_candidates = min(entry.size, max(search_k * 10, search_k))

        pipeline = [
            {
                "$vectorSearch": {
                    "index": VECTOR_SEARCH_INDEX_NAME,
                    "path": "embedding",
                    "queryVector": query_vec.tolist(),
                    "numCandidates": num_candidates,
                    "limit": search_k,
                    "filter": vs_filter,
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "courseId": 1,
                    "subject": 1,
                    "score": {"$meta": "vectorSearchScore"},
                }
            },
        ]

        try:
            raw_results = list(self._embeddings_col.aggregate(pipeline))
        except Exception as exc:
            raise RuntimeError(
                f"Vector search failed for {semester} {year}. "
                "The search index may still be building. Please try again shortly."
            ) from exc

        scored = [
            (r["score"], r.get("subject"), r.get("courseId"))
            for r in raw_results
            if r.get("score", 0.0) >= threshold
        ]

        # Sort by score descending — backend preserves this order for ranking
        scored.sort(key=lambda x: x[0], reverse=True)

        results = [{"subject": subj, "courseNumber": cn} for _, subj, cn in scored]
        return results, entry

    def describe_indices(self) -> List[Dict]:
        with self._lock:
            entries = list(self._indices.values())
        return [
            {
                "year": entry.year,
                "semester": entry.semester,
                "allowed_subjects": entry.allowed_subjects,
                "size": entry.size,
                "last_refreshed": entry.last_refreshed.isoformat(),
            }
            for entry in entries
        ]

    def _get_or_build_index(
        self, year: int, semester: str, allowed_subjects: Optional[Iterable[str]]
    ) -> TermIndex:
        canonical_semester = semester.strip()
        key = self._key(year, canonical_semester)

        with self._lock:
            entry = self._indices.get(key)

        if entry:
            return entry

        # Try loading from MongoDB before building
        loaded = self._load_mongo_index(year, canonical_semester)
        if loaded:
            with self._lock:
                self._indices[key] = loaded
            return loaded

        # Index not ready — start a background build if nothing is already running,
        # then return an error immediately so the request doesn't hang.
        self.refresh_async(year, canonical_semester, allowed_subjects)
        raise RuntimeError(
            f"Index for {canonical_semester} {year} is still being built. Please try again in a moment."
        )

    def _resolve_allowed_subjects(
        self, allowed_subjects: Optional[Iterable[str]]
    ) -> Optional[Set[str]]:
        if allowed_subjects:
            cleaned = {item.strip().upper() for item in allowed_subjects if item and item.strip()}
            if cleaned:
                return cleaned
        return set(self.default_allowed_subjects) if self.default_allowed_subjects else None

    def _fetch_courses(self, year: int, semester: str, max_retries: int = 12) -> List[Dict]:
        """Fetch courses from backend with retry logic for K8s startup race conditions.

        Default 12 retries with exponential backoff (capped at 30s):
        1, 2, 4, 8, 16, 30, 30, 30, 30, 30, 30, 30 = ~4 minutes of waits + request time
        This should be enough for backend to start in K8s.
        """
        last_error = None
        for attempt in range(max_retries):
            try:
                resp = requests.post(
                    self.catalog_url,
                    json={
                        "id": SEMANTIC_SEARCH_OPERATION_IDS["SemanticSearchCatalog"],
                        "variables": {"year": year, "semester": semester},
                    },
                    timeout=30,  # Reduced timeout per request, rely on retries instead
                )
                resp.raise_for_status()
                payload = resp.json()
                if "errors" in payload:
                    raise RuntimeError(f"Catalog query returned errors: {payload['errors']}")
                return payload.get("data", {}).get("catalog") or []
            except Exception as e:
                last_error = e
                if attempt < max_retries - 1:
                    wait_time = min(2 ** attempt, 30)
                    if attempt == 0 or attempt % 4 == 0:
                        logger.warning("Fetch failed (attempt %d/%d), retrying...", attempt + 1, max_retries)
                    time.sleep(wait_time)
        raise last_error

    @staticmethod
    def _build_course_text(course: Dict) -> str:
        """Build the text the encoder embeds."""
        subj = (course.get("subject") or "").strip()
        num = course.get("courseNumber", "")
        detail = course.get("course") or {}
        title = (detail.get("title") or "").strip()
        desc = (detail.get("description") or "").strip()
        org = (detail.get("academicOrganizationName") or "").strip()

        parts = [f"{subj} {num}: {title}."]
        if org:
            parts.append(f"Offered by the {org} department.")
        if desc:
            parts.append(desc)
        return " ".join(parts)

    @staticmethod
    def _hash_course_text(text: str) -> str:
        return hashlib.sha256(text.encode()).hexdigest()

    def _load_existing_hashes(self, year: int, semester: str) -> Dict[Tuple[str, str], str]:
        try:
            cursor = self._embeddings_col.find(
                {"year": year, "semester": semester},
                {"courseId": 1, "subject": 1, "contentHash": 1, "_id": 0},
            )
            return {
                (doc.get("subject") or "", doc["courseId"]): (doc.get("contentHash") or "")
                for doc in cursor
            }
        except Exception as exc:
            logger.warning("Failed to load existing hashes from MongoDB: %s", exc)
            return {}

    def _deduplicate_courses(self, courses: List[Dict]) -> List[Dict]:
        seen = set()
        unique: List[Dict] = []
        dropped = 0
        for course in courses:
            course_meta = course.get("course") or {}
            subject = (
                course_meta.get("subject")
                or course.get("subject")
                or ""
            ).strip().upper()
            course_number = (
                course_meta.get("number")
                or course.get("courseNumber")
                or ""
            ).strip().upper()
            key = (subject, course_number)
            if key in seen:
                dropped += 1
                continue
            seen.add(key)
            unique.append(course)
        return unique

    def fetch_available_terms(self) -> List[Tuple[int, str]]:
        """Fetch list of unique available terms from backend."""
        try:
            resp = requests.post(
                self.catalog_url,
                json={
                    "id": SEMANTIC_SEARCH_OPERATION_IDS["SemanticSearchTerms"]
                },
                timeout=30,
            )
            resp.raise_for_status()
            payload = resp.json()
            if "errors" in payload:
                raise RuntimeError(
                    f"Terms query returned errors: {payload['errors']}"
                )
            terms_data = payload.get("data", {}).get("terms") or []
            seen = set()
            unique_terms = []
            for t in terms_data:
                if t.get("year") and t.get("semester"):
                    key = (t["year"], t["semester"])
                    if key not in seen:
                        seen.add(key)
                        unique_terms.append(key)
            return unique_terms
        except Exception as exc:
            self._last_error = str(exc)
            logger.error("Failed to fetch available terms: %s", exc)
            return []

    def _evict_old_indexes(self, max_terms: int = 2) -> None:
        """Delete MongoDB embeddings beyond the most recent max_terms terms."""
        try:
            pipeline = [{"$group": {"_id": {"year": "$year", "semester": "$semester"}}}]
            all_terms = [
                (t["_id"]["year"], t["_id"]["semester"])
                for t in self._embeddings_col.aggregate(pipeline)
            ]

            all_terms.sort(
                key=lambda t: (t[0], SEMESTER_ORDER.get(t[1], 0)),
                reverse=True,
            )

            for year, semester in all_terms[max_terms:]:
                self._embeddings_col.delete_many({"year": year, "semester": semester})
                stale_key = self._key(year, semester)
                with self._lock:
                    self._indices.pop(stale_key, None)
                logger.info("Evicted old index: %s %s", semester, year)
        except Exception as exc:
            logger.warning("Failed to evict old indexes: %s", exc)

    def build_startup_indexes(self, max_startup_terms: int = 2) -> None:
        """Load indexes from MongoDB and queue builds for the 2 most recent terms only."""
        available_terms = self.fetch_available_terms()
        if not available_terms:
            if DEFAULT_TERM:
                self._build_queue = [DEFAULT_TERM]
            return

        available_terms.sort(key=lambda t: (t[0], SEMESTER_ORDER.get(t[1], 0)), reverse=True)
        keep_terms = available_terms[:max_startup_terms]

        terms_to_build = []
        for year, semester in keep_terms:
            loaded = self._load_mongo_index(year, semester)
            if loaded:
                key = self._key(loaded.year, loaded.semester)
                with self._lock:
                    self._indices[key] = loaded
            else:
                terms_to_build.append((year, semester))

        self._build_queue = terms_to_build
        if terms_to_build:
            logger.info("Need to build %d indexes: %s",
                       len(terms_to_build),
                       ", ".join(f"{s} {y}" for y, s in terms_to_build))

    def process_build_queue(self, max_rounds: int = 10, base_delay: int = 30) -> None:
        """Process the build queue, building each term in sequence with retries."""
        for round_num in range(max_rounds):
            if not self._build_queue:
                break

            failed: List[Tuple[int, str]] = []
            while self._build_queue:
                year, semester = self._build_queue.pop(0)
                try:
                    key = self._key(year, semester)
                    with self._lock:
                        if key in self._indices:
                            continue
                    self.refresh(year, semester)
                except RuntimeError as exc:
                    if "did not contain any courses" in str(exc):
                        logger.info("Skipping %s %s (no courses)", semester, year)
                    else:
                        self._last_error = f"{semester} {year}: {exc}"
                        logger.error("Failed to build %s %s: %s", semester, year, exc)
                        failed.append((year, semester))
                except Exception as exc:
                    self._last_error = f"{semester} {year}: {exc}"
                    logger.error("Failed to build %s %s: %s", semester, year, exc)
                    failed.append((year, semester))

            if not failed:
                break

            self._build_queue = failed
            wait = min(base_delay * (round_num + 1), 120)
            logger.info(
                "Retrying %d failed build(s) in %ds (round %d/%d)",
                len(failed), wait, round_num + 1, max_rounds,
            )
            time.sleep(wait)

    def get_build_duration_seconds(self) -> Optional[float]:
        """Get current build duration in seconds, or None if not building."""
        if self._build_started:
            return (datetime.utcnow() - self._build_started).total_seconds()
        return None

    def get_queue_status(self) -> List[str]:
        """Get list of terms waiting to be built."""
        return [f"{sem} {yr}" for yr, sem in self._build_queue]
