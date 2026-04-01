import json
import logging
import os
import threading
import time
from dataclasses import dataclass
from datetime import datetime
from functools import lru_cache
from typing import Dict, Iterable, List, Optional, Set, Tuple

import numpy as np
import redis
import requests
from redisvl.index import SearchIndex
from redisvl.query import VectorQuery
from redisvl.redis.utils import array_to_buffer
from sentence_transformers import SentenceTransformer

logger = logging.getLogger("semantic-search")

# Semester order for comparison
SEMESTER_ORDER = {"Spring": 0, "Summer": 1, "Fall": 2, "Winter": 3}

# Redis connection — shared with the rest of the codebase via REDIS_URI
REDIS_URI = os.getenv("REDIS_URI", "redis://redis:6379")

# Namespace prefix keeps all semantic-search keys isolated in the shared Redis instance
INDEX_PREFIX = "semantic_search"

COURSE_QUERY = """
query Catalog($year: Int!, $semester: Semester!) {
  catalog(year: $year, semester: $semester) {
    courseNumber
    subject
    number
    course {
      title
      description
    }
  }
}
"""

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
    index: SearchIndex
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
        self._build_queue: List[Tuple[int, str]] = []  # Queue of (year, semester) to build
        self._redis = redis.from_url(REDIS_URI, decode_responses=True)

    def _get_index_name(self, year: int, semester: str, allowed_subjects: Optional[List[str]]) -> str:
        suffix = ",".join(allowed_subjects) if allowed_subjects else "all"
        return f"{INDEX_PREFIX}:{year}:{semester}:{suffix}"

    def _meta_key(self, index_name: str) -> str:
        return f"{INDEX_PREFIX}:meta:{index_name}"

    def _build_schema(self, index_name: str) -> dict:
        return {
            "index": {
                "name": index_name,
                "prefix": f"{index_name}:doc",
            },
            "fields": [
                {"name": "subject", "type": "tag"},
                {"name": "course_number", "type": "tag"},
                {"name": "title", "type": "text"},
                {"name": "description", "type": "text"},
                {"name": "course_text", "type": "text"},
                {
                    "name": "embedding",
                    "type": "vector",
                    "attrs": {
                        "dims": self._embedding_dims,
                        "algorithm": "hnsw",
                        "datatype": "float32",
                        "distance_metric": "cosine",
                    },
                },
            ],
        }

    def _save_index_metadata(self, entry: TermIndex) -> None:
        index_name = self._get_index_name(entry.year, entry.semester, entry.allowed_subjects)
        meta = {
            "last_refreshed": entry.last_refreshed.isoformat(),
            "size": entry.size,
            "year": entry.year,
            "semester": entry.semester,
            "allowed_subjects": entry.allowed_subjects,
        }
        try:
            self._redis.set(self._meta_key(index_name), json.dumps(meta))
        except Exception as exc:
            logger.warning("Failed to save index metadata to Redis: %s", exc)

    def _load_redis_index(self, year: int, semester: str, allowed_subjects: Optional[List[str]]) -> Optional[TermIndex]:
        """Load an existing RedisVL index from Redis if it exists."""
        try:
            index_name = self._get_index_name(year, semester, allowed_subjects)
            schema = self._build_schema(index_name)
            search_index = SearchIndex.from_dict(schema, redis_url=REDIS_URI)

            if not search_index.exists():
                return None

            meta_raw = self._redis.get(self._meta_key(index_name))
            if not meta_raw:
                return None

            meta = json.loads(meta_raw)
            entry = TermIndex(
                index=search_index,
                size=meta["size"],
                last_refreshed=datetime.fromisoformat(meta["last_refreshed"]),
                year=meta["year"],
                semester=meta["semester"],
                allowed_subjects=meta["allowed_subjects"],
            )
            logger.info("Loaded from Redis: %s %s (%d courses)", entry.semester, entry.year, entry.size)
            return entry
        except Exception as exc:
            logger.warning("Failed to load index from Redis: %s", exc)
            return None

    def refresh(
        self, year: int, semester: str, allowed_subjects: Optional[Iterable[str]] = None
    ) -> TermIndex:
        term_semester = semester.strip()
        allowed = self._resolve_allowed_subjects(allowed_subjects)
        build_key = f"{term_semester} {year}"

        logger.info("Building index for %s %s", term_semester, year)

        self._building = build_key
        self._build_started = datetime.utcnow()
        try:
            raw_courses = self._fetch_courses(year, term_semester)
            courses = self._deduplicate_courses(raw_courses)
            if not courses:
                raise RuntimeError("Catalog response did not contain any courses")

            course_texts: List[str] = []
            filtered_courses: List[Dict] = []

            for course in courses:
                subj = (course.get("subject") or "").strip()
                if allowed and subj and subj.upper() not in allowed:
                    continue
                course_texts.append(self._build_course_text(course))
                filtered_courses.append(course)

            if not course_texts:
                logger.warning("Subject filter removed every course; rebuilding without filter")
                course_texts = [self._build_course_text(course) for course in courses]
                filtered_courses = list(courses)

            logger.info("Encoding %d courses...", len(course_texts))
            embeddings = np.asarray(self.model.encode(course_texts, batch_size=128, convert_to_numpy=True), dtype="float32")

            # Create (or overwrite) the RedisVL index
            sorted_allowed = sorted(allowed) if allowed else None
            index_name = self._get_index_name(year, term_semester, sorted_allowed)
            schema = self._build_schema(index_name)
            search_index = SearchIndex.from_dict(schema, redis_url=REDIS_URI)
            search_index.create(overwrite=True)

            # Load course vectors into Redis
            data = []
            for i, (course, text) in enumerate(zip(filtered_courses, course_texts)):
                course_meta = course.get("course") or {}
                data.append({
                    "subject": course.get("subject") or "",
                    "course_number": course.get("courseNumber") or "",
                    "title": (course_meta.get("title") or "").strip(),
                    "description": (course_meta.get("description") or "").strip(),
                    "course_text": text,
                    "embedding": array_to_buffer(embeddings[i], dtype="float32"),
                })
            search_index.load(data)

            entry = TermIndex(
                index=search_index,
                size=len(course_texts),
                last_refreshed=datetime.utcnow(),
                year=year,
                semester=term_semester,
                allowed_subjects=sorted_allowed,
            )

            with self._lock:
                self._indices[self._key(entry.year, entry.semester, entry.allowed_subjects)] = entry

            self._save_index_metadata(entry)

            logger.info("Index ready: %s %s (%d courses)", term_semester, year, len(course_texts))
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
            # Check if already building
            if self._building:
                return {
                    "status": "already_building",
                    "building": self._building,
                    "message": f"Already building index for {self._building}",
                }

            # Check if thread is still running
            if self._build_thread and self._build_thread.is_alive():
                return {
                    "status": "already_building",
                    "building": self._building,
                    "message": "A build is already in progress",
                }

            # Clear previous error
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

    @lru_cache(maxsize=256)
    def _encode_query(self, prefixed_query: str) -> np.ndarray:
        return np.asarray(self.model.encode([prefixed_query], convert_to_numpy=True), dtype="float32")[0]

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
        query_vec = self._encode_query(prefixed_query)

        vq = VectorQuery(
            vector=query_vec.tolist(),
            vector_field_name="embedding",
            return_fields=["subject", "course_number", "title", "description", "course_text"],
            num_results=search_k,
        )

        raw_results = entry.index.query(vq)

        # RedisVL COSINE distance = 1 - cosine_similarity, so convert threshold accordingly
        distance_threshold = 1.0 - threshold
        results = []
        for r in raw_results:
            dist = float(r.get("vector_distance", 1.0))
            if dist > distance_threshold:
                continue
            results.append(
                {
                    "subject": r.get("subject") or None,
                    "courseNumber": r.get("course_number") or None,
                    "title": r.get("title") or "",
                    "description": r.get("description") or "",
                    "score": 1.0 - dist,
                    "text": r.get("course_text") or "",
                }
            )

        # Sort by score only - semantic similarity is more accurate than keyword matching
        results.sort(key=lambda r: r["score"], reverse=True)

        # Return all results above threshold
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
        allowed = self._resolve_allowed_subjects(allowed_subjects)
        key = self._key(year, canonical_semester, sorted(allowed) if allowed else None)

        with self._lock:
            entry = self._indices.get(key)

        if entry:
            return entry

        # Try loading from Redis before building
        loaded = self._load_redis_index(year, canonical_semester, sorted(allowed) if allowed else None)
        if loaded:
            with self._lock:
                self._indices[key] = loaded
            return loaded

        # Index not ready — start a background build if nothing is already running,
        # then return an error immediately so the request doesn't hang.
        self.refresh_async(year, canonical_semester, allowed)
        raise RuntimeError(
            f"Index for {canonical_semester} {year} is still being built. Please try again in a moment."
        )

    def _key(self, year: int, semester: str, allowed_subjects: Optional[List[str]]) -> str:
        suffix = ",".join(allowed_subjects) if allowed_subjects else "__all__"
        return f"{year}:{semester}:{suffix}"

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
                    json={"query": COURSE_QUERY, "variables": {"year": year, "semester": semester}},
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
                    # Only log first attempt and every 4th retry to reduce noise
                    if attempt == 0 or attempt % 4 == 0:
                        logger.warning("Fetch failed (attempt %d/%d), retrying...", attempt + 1, max_retries)
                    time.sleep(wait_time)
        raise last_error

    @staticmethod
    def _build_course_text(course: Dict) -> str:
        subj = (course.get("subject") or "").strip()
        num = course.get("number", "")
        title = ((course.get("course") or {}).get("title") or "").strip()
        desc = ((course.get("course") or {}).get("description") or "").strip()
        return f"SUBJECT: {subj} NUMBER: {num}\nTITLE: {title}\nDESCRIPTION: {desc}\n"

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
        query = """
        query {
          terms {
            year
            semester
          }
        }
        """
        try:
            resp = requests.post(
                self.catalog_url,
                json={"query": query},
                timeout=30,
            )
            resp.raise_for_status()
            payload = resp.json()
            if "errors" in payload:
                return []
            terms_data = payload.get("data", {}).get("terms") or []
            # Deduplicate terms
            seen = set()
            unique_terms = []
            for t in terms_data:
                if t.get("year") and t.get("semester"):
                    key = (t["year"], t["semester"])
                    if key not in seen:
                        seen.add(key)
                        unique_terms.append(key)
            return unique_terms
        except Exception:
            return []

    def build_startup_indexes(self, max_startup_terms: int = 4) -> None:
        """Load indexes from Redis and queue builds for recent terms only.

        Only the most recent *max_startup_terms* terms are built on startup.
        Older terms are built on-demand when actually searched.
        """
        # Fetch available terms
        available_terms = self.fetch_available_terms()
        if not available_terms:
            # Fallback to default term if can't fetch
            if DEFAULT_TERM:
                self._build_queue = [DEFAULT_TERM]
            return

        # Sort terms: newest first
        available_terms.sort(key=lambda t: (t[0], SEMESTER_ORDER.get(t[1], 0)), reverse=True)

        # Only consider recent terms for startup (older ones build on-demand)
        startup_terms = available_terms[:max_startup_terms]

        # Load from Redis if available, otherwise queue for building
        terms_to_build = []
        for year, semester in startup_terms:
            loaded = self._load_redis_index(year, semester, None)
            if loaded:
                key = self._key(loaded.year, loaded.semester, loaded.allowed_subjects)
                with self._lock:
                    self._indices[key] = loaded
            else:
                terms_to_build.append((year, semester))

        # Also load any OTHER indexes already in Redis (from previous runs)
        for year, semester in available_terms[max_startup_terms:]:
            loaded = self._load_redis_index(year, semester, None)
            if loaded:
                key = self._key(loaded.year, loaded.semester, loaded.allowed_subjects)
                with self._lock:
                    self._indices[key] = loaded

        # Queue only recent terms that weren't found in Redis
        self._build_queue = terms_to_build
        if terms_to_build:
            logger.info("Need to build %d indexes: %s",
                       len(terms_to_build),
                       ", ".join(f"{s} {y}" for y, s in terms_to_build))

    def process_build_queue(self, max_rounds: int = 10, base_delay: int = 30) -> None:
        """Process the build queue, building each term in sequence with retries.

        Failed builds (e.g. backend not ready) are re-queued and retried up to
        *max_rounds* times with increasing delays between rounds.
        """
        for round_num in range(max_rounds):
            if not self._build_queue:
                break

            failed: List[Tuple[int, str]] = []
            while self._build_queue:
                year, semester = self._build_queue.pop(0)
                try:
                    # Check if already loaded
                    key = self._key(year, semester, None)
                    with self._lock:
                        if key in self._indices:
                            continue
                    self.refresh(year, semester)
                except RuntimeError as exc:
                    # Skip terms with no courses (e.g., future semesters not yet available)
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

            # Re-queue failed items and wait before retrying
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
