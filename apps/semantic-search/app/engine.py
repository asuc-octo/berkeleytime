import logging
import os
import threading
import time
from dataclasses import dataclass
from datetime import datetime
from functools import lru_cache
from typing import Dict, Iterable, List, Optional, Set, Tuple

import numpy as np
import requests
from sentence_transformers import SentenceTransformer

from .config import EMBEDDING_CONFIG, PURGE_LEGACY_INDEXES, EmbeddingConfig
from .generated_operations import SEMANTIC_SEARCH_OPERATION_IDS
from .vector_store import RedisVectorStore, VectorIndex, VectorRecord, VectorStore

logger = logging.getLogger("semantic-search")

# Semester order for comparison
SEMESTER_ORDER = {"Spring": 0, "Summer": 1, "Fall": 2, "Winter": 3}

# Redis connection — shared with the rest of the codebase via REDIS_URI
REDIS_URI = os.getenv("REDIS_URI", "redis://redis:6379")

# Backend URL for fetching course catalog (configurable for K8s vs Docker)
BACKEND_INTERNAL_URL = os.getenv("BACKEND_URL", "http://backend:5001")
DEFAULT_CATALOG_URL = f"{BACKEND_INTERNAL_URL}/api/graphql"
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
    index: VectorIndex
    size: int
    last_refreshed: datetime
    year: int
    semester: str
    allowed_subjects: Optional[List[str]]


class SemanticSearchEngine:
    def __init__(
        self,
        model=None,
        vector_store: Optional[VectorStore] = None,
        embedding_config: EmbeddingConfig = EMBEDDING_CONFIG,
    ) -> None:
        self.embedding_config = embedding_config
        self.model = (
            model
            if model is not None
            else SentenceTransformer(
                embedding_config.model_name,
                revision=embedding_config.model_revision,
            )
        )
        self._embedding_dims = self.model.get_sentence_embedding_dimension()
        self._embedding_fingerprint = embedding_config.fingerprint(self._embedding_dims)
        self._index_prefix = f"semantic_search:v2:{self._embedding_fingerprint}"
        self.catalog_url = DEFAULT_CATALOG_URL
        self.default_allowed_subjects = set(DEFAULT_ALLOWED_SUBJECTS) if DEFAULT_ALLOWED_SUBJECTS else None
        self._indices: Dict[str, TermIndex] = {}
        self._lock = threading.RLock()
        self._building: Optional[str] = None
        self._build_started: Optional[datetime] = None
        self._last_error: Optional[str] = None
        self._build_thread: Optional[threading.Thread] = None
        self._build_queue: List[Tuple[int, str]] = []  # Queue of (year, semester) to build
        self._store = vector_store or RedisVectorStore(REDIS_URI)
        self._legacy_migration_completed = False
        self._legacy_indexes_removed = 0
        self._stale_migration_completed = False
        self._stale_indexes_removed = 0

    def _get_index_name(self, year: int, semester: str, allowed_subjects: Optional[List[str]]) -> str:
        suffix = ",".join(allowed_subjects) if allowed_subjects else "all"
        return f"{self._index_prefix}:index:{year}:{semester}:{suffix}"

    def _meta_key(self, index_name: str) -> str:
        return f"{self._index_prefix}:meta:{index_name}"

    def _save_index_metadata(self, entry: TermIndex) -> None:
        index_name = self._get_index_name(entry.year, entry.semester, entry.allowed_subjects)
        meta = {
            "index_name": index_name,
            "embedding_fingerprint": self._embedding_fingerprint,
            "model_name": self.embedding_config.model_name,
            "model_revision": self.embedding_config.model_revision,
            "dimensions": self._embedding_dims,
            "vector_algorithm": self.embedding_config.vector_algorithm,
            "schema_version": self.embedding_config.schema_version,
            "last_refreshed": entry.last_refreshed.isoformat(),
            "size": entry.size,
            "year": entry.year,
            "semester": entry.semester,
            "allowed_subjects": entry.allowed_subjects,
        }
        try:
            self._store.set_metadata(self._meta_key(index_name), meta)
        except Exception as exc:
            logger.warning("Failed to save vector index metadata: %s", exc)

    def _load_vector_index(self, year: int, semester: str, allowed_subjects: Optional[List[str]]) -> Optional[TermIndex]:
        """Load a compatible index from the configured vector store if it exists."""
        try:
            index_name = self._get_index_name(year, semester, allowed_subjects)
            meta = self._store.get_metadata(self._meta_key(index_name))
            if not meta:
                return None
            if meta.get("embedding_fingerprint") != self._embedding_fingerprint:
                logger.warning("Ignoring incompatible vector index metadata: %s", index_name)
                return None
            search_index = self._store.open_index(
                index_name,
                self._embedding_dims,
                self.embedding_config.vector_algorithm,
            )
            if search_index is None:
                return None
            entry = TermIndex(
                index=search_index,
                size=meta["size"],
                last_refreshed=datetime.fromisoformat(meta["last_refreshed"]),
                year=meta["year"],
                semester=meta["semester"],
                allowed_subjects=meta["allowed_subjects"],
            )
            logger.info("Loaded vector index: %s %s (%d courses)", entry.semester, entry.year, entry.size)
            return entry
        except Exception as exc:
            logger.warning("Failed to load vector index: %s", exc)
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

            filtered_courses: List[Dict] = []

            for course in courses:
                subj = (course.get("subject") or "").strip()
                if allowed and subj and subj.upper() not in allowed:
                    continue
                filtered_courses.append(course)

            if not filtered_courses:
                logger.warning("Subject filter removed every course; rebuilding without filter")
                filtered_courses = list(courses)

            sorted_allowed = sorted(allowed) if allowed else None
            index_name = self._get_index_name(year, term_semester, sorted_allowed)
            search_index = self._store.create_index(
                index_name,
                self._embedding_dims,
                self.embedding_config.vector_algorithm,
            )

            # Encode and upload one batch at a time. This avoids holding the full
            # catalog text, embeddings, and Redis payloads in memory together.
            total = len(filtered_courses)
            logger.info("Encoding %d courses in batches of %d...", total, self.embedding_config.batch_size)
            for start in range(0, total, self.embedding_config.batch_size):
                batch = filtered_courses[start:start + self.embedding_config.batch_size]
                texts = [self._build_course_text(course) for course in batch]
                embeddings = np.asarray(
                    self.model.encode(
                        texts,
                        batch_size=self.embedding_config.batch_size,
                        convert_to_numpy=True,
                    ),
                    dtype="float32",
                )
                records = [
                    VectorRecord(
                        subject=(course.get("subject") or "").strip(),
                        course_number=(course.get("courseNumber") or "").strip(),
                        embedding=embeddings[i],
                    )
                    for i, course in enumerate(batch)
                ]
                self._store.load_batch(search_index, records)

            entry = TermIndex(
                index=search_index,
                size=total,
                last_refreshed=datetime.utcnow(),
                year=year,
                semester=term_semester,
                allowed_subjects=sorted_allowed,
            )

            with self._lock:
                self._indices[self._key(entry.year, entry.semester, entry.allowed_subjects)] = entry

            self._save_index_metadata(entry)
            self._purge_stale_indexes()

            # Clean up indexes beyond the 2 most recent terms
            self._evict_old_indexes()

            logger.info("Index ready: %s %s (%d courses)", term_semester, year, total)
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
        prefixed_query = self.embedding_config.query_prefix + query
        query_vec = self._encode_query(prefixed_query)
        raw_results = entry.index.search(query_vec, search_k)

        # Vector-store adapters return cosine distance (1 - cosine similarity).
        distance_threshold = 1.0 - threshold
        scored = []
        for result in raw_results:
            dist = result.distance
            if dist > distance_threshold:
                continue
            scored.append((1.0 - dist, result.subject, result.course_number))

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

    def describe_configuration(self) -> Dict:
        return {
            "vector_store": self._store.backend_name,
            "embedding_profile": self.embedding_config.profile,
            "embedding_model": self.embedding_config.model_name,
            "embedding_model_revision": self.embedding_config.model_revision,
            "embedding_dimensions": self._embedding_dims,
            "embedding_fingerprint": self._embedding_fingerprint,
            "vector_algorithm": self.embedding_config.vector_algorithm,
            "index_schema_version": self.embedding_config.schema_version,
            "embedding_batch_size": self.embedding_config.batch_size,
            "legacy_migration_completed": self._legacy_migration_completed,
            "legacy_indexes_removed": self._legacy_indexes_removed,
            "stale_migration_completed": self._stale_migration_completed,
            "stale_indexes_removed": self._stale_indexes_removed,
        }

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
        loaded = self._load_vector_index(year, canonical_semester, sorted(allowed) if allowed else None)
        if loaded:
            with self._lock:
                self._indices[key] = loaded
            return loaded

        raise RuntimeError(
            f"Index for {canonical_semester} {year} is not available."
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
                    # Only log first attempt and every 4th retry to reduce noise
                    if attempt == 0 or attempt % 4 == 0:
                        logger.warning("Fetch failed (attempt %d/%d), retrying...", attempt + 1, max_retries)
                    time.sleep(wait_time)
        raise last_error

    @staticmethod
    def _build_course_text(course: Dict) -> str:
        subj = (course.get("subject") or "").strip()
        num = course.get("courseNumber") or course.get("number", "")
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
        except Exception as exc:
            self._last_error = str(exc)
            logger.error("Failed to fetch available terms: %s", exc)
            return []

    def _evict_old_indexes(self, max_terms: int = 2) -> None:
        """Delete vector indexes beyond the most recent max_terms terms."""
        try:
            all_meta = self._store.scan_metadata(f"{self._index_prefix}:meta:*")

            # Retention is based on distinct academic terms, not index variants.
            # Otherwise filtered indexes for one term can crowd the production
            # unfiltered index out of the fixed-size metadata list.
            terms = {
                (meta.get("year", 0), meta.get("semester", ""))
                for meta in all_meta
            }
            newest_terms = sorted(
                terms,
                key=lambda term: (term[0], SEMESTER_ORDER.get(term[1], 0)),
                reverse=True,
            )[:max_terms]
            keep_terms = set(newest_terms)

            for meta in all_meta:
                if (meta.get("year", 0), meta.get("semester", "")) in keep_terms:
                    continue
                try:
                    index_name = meta.get("index_name") or self._get_index_name(
                        meta["year"], meta["semester"], meta.get("allowed_subjects")
                    )
                    self._store.delete_index(index_name)
                    self._store.delete_metadata(meta["_meta_key"])
                    # Also evict from in-memory cache
                    stale_key = self._key(meta["year"], meta["semester"], meta.get("allowed_subjects"))
                    with self._lock:
                        self._indices.pop(stale_key, None)
                    logger.info("Evicted old index: %s %s", meta.get("semester"), meta.get("year"))
                except Exception as exc:
                    logger.warning("Failed to evict index %s %s: %s", meta.get("semester"), meta.get("year"), exc)
        except Exception as exc:
            logger.warning("Failed to scan for old indexes: %s", exc)

    def _migrate_legacy_indexes(self) -> None:
        if self._legacy_migration_completed:
            return
        if PURGE_LEGACY_INDEXES:
            self._legacy_indexes_removed = self._store.purge_legacy_indexes()
            if self._legacy_indexes_removed:
                logger.info(
                    "Removed %d legacy semantic-search index(es)",
                    self._legacy_indexes_removed,
                )
        self._legacy_migration_completed = True

    def _purge_stale_indexes(self) -> None:
        if self._stale_migration_completed:
            return
        if PURGE_LEGACY_INDEXES:
            self._stale_indexes_removed = self._store.purge_stale_indexes(
                self._index_prefix
            )
            if self._stale_indexes_removed:
                logger.info(
                    "Removed %d stale semantic-search index(es)",
                    self._stale_indexes_removed,
                )
        self._stale_migration_completed = True

    def build_startup_indexes(self, max_startup_terms: int = 2) -> None:
        """Load vector indexes and queue builds for the 2 most recent terms only."""
        self._migrate_legacy_indexes()
        # Fetch available terms
        available_terms = self.fetch_available_terms()
        if not available_terms:
            # Fallback to default term if can't fetch
            if DEFAULT_TERM:
                self._build_queue = [DEFAULT_TERM]
            return

        # Sort terms: newest first
        available_terms.sort(key=lambda t: (t[0], SEMESTER_ORDER.get(t[1], 0)), reverse=True)

        # Only consider the most recent terms
        keep_terms = available_terms[:max_startup_terms]

        # Load from Redis if available, otherwise queue for building
        terms_to_build = []
        for year, semester in keep_terms:
            loaded = self._load_vector_index(year, semester, None)
            if loaded:
                key = self._key(loaded.year, loaded.semester, loaded.allowed_subjects)
                with self._lock:
                    self._indices[key] = loaded
                self._purge_stale_indexes()
            else:
                terms_to_build.append((year, semester))

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
