import logging
import os
import pickle
import threading
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Set, Tuple

import faiss
import numpy as np
import requests
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer

logger = logging.getLogger("semantic-search")
logging.basicConfig(level=os.getenv("SEMANTIC_SEARCH_LOG_LEVEL", "INFO"))

# Semester order for comparison
SEMESTER_ORDER = {"Spring": 0, "Summer": 1, "Fall": 2, "Winter": 3}

# Directory for persisting FAISS indices
INDEX_STORAGE_DIR = Path(os.getenv("INDEX_STORAGE_DIR", "/app/indexes"))
INDEX_STORAGE_DIR.mkdir(parents=True, exist_ok=True)

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
    index: faiss.IndexFlatIP
    embeddings: np.ndarray
    courses: List[Dict]
    course_texts: List[str]
    kept_idx: List[int]
    last_refreshed: datetime
    year: int
    semester: str
    allowed_subjects: Optional[List[str]]


class SemanticSearchEngine:
    def __init__(self) -> None:
        self.model = SentenceTransformer(MODEL_NAME)
        self.catalog_url = DEFAULT_CATALOG_URL
        self.default_allowed_subjects = set(DEFAULT_ALLOWED_SUBJECTS) if DEFAULT_ALLOWED_SUBJECTS else None
        self._indices: Dict[str, TermIndex] = {}
        self._lock = threading.RLock()
        self._building: Optional[str] = None
        self._build_started: Optional[datetime] = None
        self._last_error: Optional[str] = None
        self._build_thread: Optional[threading.Thread] = None
        self._build_queue: List[Tuple[int, str]] = []  # Queue of (year, semester) to build

    def _get_index_path(self, year: int, semester: str, allowed_subjects: Optional[List[str]]) -> Path:
        """Get filesystem path for persisted index."""
        suffix = ",".join(allowed_subjects) if allowed_subjects else "all"
        filename = f"{year}_{semester}_{suffix}.index"
        return INDEX_STORAGE_DIR / filename

    def _save_index(self, entry: TermIndex) -> None:
        """Save FAISS index and metadata to disk."""
        try:
            index_path = self._get_index_path(entry.year, entry.semester, entry.allowed_subjects)

            # Save FAISS index
            faiss.write_index(entry.index, str(index_path.with_suffix(".faiss")))

            # Save metadata (everything except the FAISS index)
            metadata = {
                "embeddings": entry.embeddings,
                "courses": entry.courses,
                "course_texts": entry.course_texts,
                "kept_idx": entry.kept_idx,
                "last_refreshed": entry.last_refreshed,
                "year": entry.year,
                "semester": entry.semester,
                "allowed_subjects": entry.allowed_subjects,
            }
            with open(index_path.with_suffix(".pkl"), "wb") as f:
                pickle.dump(metadata, f)

            logger.info("Saved to disk: %s", index_path.stem)
        except Exception as exc:
            logger.warning("Failed to save index to disk: %s", exc)

    def _load_index(self, year: int, semester: str, allowed_subjects: Optional[List[str]]) -> Optional[TermIndex]:
        """Load FAISS index and metadata from disk if available."""
        try:
            index_path = self._get_index_path(year, semester, allowed_subjects)
            faiss_file = index_path.with_suffix(".faiss")
            pkl_file = index_path.with_suffix(".pkl")

            if not faiss_file.exists() or not pkl_file.exists():
                return None

            # Load FAISS index
            index = faiss.read_index(str(faiss_file))

            # Load metadata
            with open(pkl_file, "rb") as f:
                metadata = pickle.load(f)

            entry = TermIndex(
                index=index,
                embeddings=metadata["embeddings"],
                courses=metadata["courses"],
                course_texts=metadata["course_texts"],
                kept_idx=metadata["kept_idx"],
                last_refreshed=metadata["last_refreshed"],
                year=metadata["year"],
                semester=metadata["semester"],
                allowed_subjects=metadata["allowed_subjects"],
            )

            logger.info("Loaded from disk: %s %s (%d courses)", entry.semester, entry.year, len(entry.course_texts))
            return entry
        except Exception as exc:
            logger.warning("Failed to load index from disk: %s", exc)
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
            kept_idx: List[int] = []

            for i, course in enumerate(courses):
                subj = (course.get("subject") or "").strip()
                if allowed and subj and subj.upper() not in allowed:
                    continue
                course_texts.append(self._build_course_text(course))
                kept_idx.append(i)

            if not course_texts:
                logger.warning("Subject filter removed every course; rebuilding without filter")
                course_texts = [self._build_course_text(course) for course in courses]
                kept_idx = list(range(len(courses)))

            logger.info("Encoding %d courses...", len(course_texts))
            embeddings = np.asarray(self.model.encode(course_texts, convert_to_numpy=True), dtype="float32")
            faiss.normalize_L2(embeddings)
            index = faiss.IndexFlatIP(embeddings.shape[1])
            index.add(embeddings)

            entry = TermIndex(
                index=index,
                embeddings=embeddings,
                courses=courses,
                course_texts=course_texts,
                kept_idx=kept_idx,
                last_refreshed=datetime.utcnow(),
                year=year,
                semester=term_semester,
                allowed_subjects=sorted(allowed) if allowed else None,
            )

            with self._lock:
                self._indices[self._key(entry.year, entry.semester, entry.allowed_subjects)] = entry

            # Save index to disk for persistence
            self._save_index(entry)

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

    def search(
        self,
        query: str,
        year: int,
        semester: str,
        threshold: float = 0.3,
        allowed_subjects: Optional[Iterable[str]] = None,
    ) -> Tuple[List[Dict], TermIndex]:
        entry = self._get_or_build_index(year, semester, allowed_subjects)
        embeddings = entry.embeddings

        # Search top 500 candidates, then filter by threshold
        # This balances performance vs completeness
        search_k = min(len(embeddings), 500)
        if search_k == 0:
            return [], entry

        # BGE models work better with instruction prefix for queries
        prefixed_query = QUERY_PREFIX + query
        query_vec = np.asarray(self.model.encode([prefixed_query], convert_to_numpy=True), dtype="float32")
        faiss.normalize_L2(query_vec)
        sims, idxs = entry.index.search(query_vec, search_k)

        results = []
        for score, local_idx in zip(sims[0], idxs[0]):
            # Apply threshold filter
            if score < threshold:
                continue

            original = entry.courses[entry.kept_idx[local_idx]]
            title = ((original.get("course") or {}).get("title") or "")
            desc = ((original.get("course") or {}).get("description") or "")
            text = entry.course_texts[local_idx]
            results.append(
                {
                    "subject": original.get("subject"),
                    "courseNumber": original.get("courseNumber"),
                    "title": title,
                    "description": desc,
                    "score": float(score),
                    "text": text,
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
                "size": len(entry.course_texts),
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

        # Try loading from disk before building
        loaded = self._load_index(year, canonical_semester, sorted(allowed) if allowed else None)
        if loaded:
            with self._lock:
                self._indices[key] = loaded
            return loaded

        return self.refresh(year, canonical_semester, allowed)

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

    def build_startup_indexes(self) -> None:
        """Load all available indexes from disk. Only build if not on disk."""
        # Fetch available terms
        available_terms = self.fetch_available_terms()
        if not available_terms:
            # Fallback to default term if can't fetch
            if DEFAULT_TERM:
                self._build_queue = [DEFAULT_TERM]
            return

        # Sort terms: newest first
        available_terms.sort(key=lambda t: (t[0], SEMESTER_ORDER.get(t[1], 0)), reverse=True)

        # Try to load ALL terms from disk first
        terms_to_build = []
        for year, semester in available_terms:
            loaded = self._load_index(year, semester, None)
            if loaded:
                key = self._key(loaded.year, loaded.semester, loaded.allowed_subjects)
                with self._lock:
                    self._indices[key] = loaded
            else:
                # Not on disk, queue for building
                terms_to_build.append((year, semester))

        # Queue terms that weren't found on disk
        self._build_queue = terms_to_build
        if terms_to_build:
            logger.info("Need to build %d indexes: %s",
                       len(terms_to_build),
                       ", ".join(f"{s} {y}" for y, s in terms_to_build))

    def process_build_queue(self) -> None:
        """Process the build queue, building each term in sequence."""
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
            except Exception as exc:
                self._last_error = f"{semester} {year}: {exc}"
                logger.error("Failed to build %s %s: %s", semester, year, exc)

    def get_build_duration_seconds(self) -> Optional[float]:
        """Get current build duration in seconds, or None if not building."""
        if self._build_started:
            return (datetime.utcnow() - self._build_started).total_seconds()
        return None

    def get_queue_status(self) -> List[str]:
        """Get list of terms waiting to be built."""
        return [f"{sem} {yr}" for yr, sem in self._build_queue]


engine = SemanticSearchEngine()
app = FastAPI()


class RefreshRequest(BaseModel):
    year: int = Field(..., ge=2000, le=2100)
    semester: str
    allowed_subjects: Optional[List[str]] = None


VALID_SEMESTERS = {"Fall", "Spring", "Summer", "Winter"}


def normalize_semester(semester: str) -> str:
    """Normalize semester string to capitalized format and validate."""
    normalized = semester.strip().capitalize()
    if normalized not in VALID_SEMESTERS:
        raise ValueError(f"Invalid semester '{semester}'. Must be one of: {', '.join(VALID_SEMESTERS)}")
    return normalized


def resolve_term(year: Optional[int], semester: Optional[str]) -> Tuple[int, str]:
    if year is not None and semester:
        try:
            return year, normalize_semester(semester)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
    if DEFAULT_TERM:
        return DEFAULT_TERM
    raise HTTPException(status_code=400, detail="year and semester are required when no default term is configured")


@app.on_event("startup")
def build_index() -> None:
    """Start background index building for all relevant terms."""
    def startup_build():
        try:
            engine.build_startup_indexes()
            engine.process_build_queue()
        except Exception as exc:
            engine._last_error = str(exc)
            logger.error("Startup build failed: %s", exc)

    thread = threading.Thread(target=startup_build, daemon=True)
    thread.start()
    logger.info("Started background index building")


@app.get("/health")
def health():
    indexes = engine.describe_indices()
    building = engine._building
    build_duration = engine.get_build_duration_seconds()
    queue = engine.get_queue_status()
    last_error = engine._last_error

    if building:
        status = "building"
    elif queue:
        status = "queued"
    elif indexes:
        status = "ok"
    elif last_error:
        status = "error"
    else:
        status = "waiting"

    return {
        "status": status,
        "building": building,
        "build_duration_seconds": round(build_duration, 1) if build_duration else None,
        "queue": queue,
        "last_error": last_error,
        "indexes": indexes,
    }


@app.post("/refresh")
def refresh_index(payload: RefreshRequest):
    """
    Start building index in background. Returns immediately.
    Check /health endpoint for build status.
    """
    try:
        normalized_semester = normalize_semester(payload.semester)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    result = engine.refresh_async(payload.year, normalized_semester, payload.allowed_subjects)
    return result


@app.get("/search")
def search(
    query: str,
    threshold: float = Query(0.3, ge=0.0, le=1.0),
    year: Optional[int] = None,
    semester: Optional[str] = None,
    allowed_subjects: List[str] = Query(default_factory=list),
):
    if not query:
        raise HTTPException(status_code=400, detail="query parameter is required")

    try:
        resolved_year, resolved_semester = resolve_term(year, semester)
        results, entry = engine.search(
            query,
            resolved_year,
            resolved_semester,
            threshold=threshold,
            allowed_subjects=allowed_subjects or None,
        )
    except HTTPException:
        raise
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return {
        "query": query,
        "threshold": threshold,
        "count": len(results),
        "year": resolved_year,
        "semester": resolved_semester,
        "allowed_subjects": entry.allowed_subjects,
        "last_refreshed": entry.last_refreshed.isoformat(),
        "results": results,
    }
