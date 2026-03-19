import logging
import os
import threading
import time
from typing import List, Optional, Tuple

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .engine import DEFAULT_TERM, SemanticSearchEngine

logger = logging.getLogger("semantic-search")
logging.basicConfig(level=os.getenv("SEMANTIC_SEARCH_LOG_LEVEL", "INFO"))

engine = SemanticSearchEngine()
app = FastAPI()


class RefreshRequest(BaseModel):
    year: int = Field(..., ge=2000, le=2100)
    semester: str
    allowed_subjects: Optional[List[str]] = None


class SearchRequest(BaseModel):
    query: str
    threshold: float = Field(0.3, ge=0.0, le=1.0)
    year: Optional[int] = None
    semester: Optional[str] = None
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
    """Start background index building for all relevant terms.

    Retries the entire discover -> load -> build cycle so that the service
    recovers when the backend starts after the semantic-search pod.
    """
    MAX_STARTUP_RETRIES = 10

    def startup_build():
        for attempt in range(MAX_STARTUP_RETRIES):
            try:
                engine.build_startup_indexes()
                engine.process_build_queue()

                # Success: at least one index is available
                if engine.describe_indices():
                    logger.info("Startup build complete")
                    return
            except Exception as exc:
                engine._last_error = str(exc)
                logger.error("Startup build attempt %d/%d failed: %s",
                             attempt + 1, MAX_STARTUP_RETRIES, exc)

            if attempt < MAX_STARTUP_RETRIES - 1:
                wait = min(60 * (attempt + 1), 300)
                logger.info("No indexes available yet, retrying in %ds (attempt %d/%d)...",
                            wait, attempt + 1, MAX_STARTUP_RETRIES)
                time.sleep(wait)

        logger.error("Startup build exhausted all %d retries", MAX_STARTUP_RETRIES)

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


@app.post("/search")
def search(payload: SearchRequest):
    if not payload.query:
        raise HTTPException(status_code=400, detail="query is required")

    try:
        resolved_year, resolved_semester = resolve_term(payload.year, payload.semester)
        results, entry = engine.search(
            payload.query,
            resolved_year,
            resolved_semester,
            threshold=payload.threshold,
            allowed_subjects=payload.allowed_subjects or None,
        )
    except HTTPException:
        raise
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return {
        "query": payload.query,
        "threshold": payload.threshold,
        "count": len(results),
        "year": resolved_year,
        "semester": resolved_semester,
        "allowed_subjects": entry.allowed_subjects,
        "last_refreshed": entry.last_refreshed.isoformat(),
        "results": results,
    }
