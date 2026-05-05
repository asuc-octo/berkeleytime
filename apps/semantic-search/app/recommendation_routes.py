import logging
from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from . import recommendation_engine

logger = logging.getLogger("semantic-search.recommendation_routes")

router = APIRouter(prefix="/recommend", tags=["recommend"])

VALID_SEMESTERS = {"Fall", "Spring", "Summer", "Winter"}


def _normalize_semester(semester: str) -> str:
    normalized = semester.strip().capitalize()
    if normalized not in VALID_SEMESTERS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid semester '{semester}'. Must be one of: {', '.join(sorted(VALID_SEMESTERS))}",
        )
    return normalized


class BecauseViewedRequest(BaseModel):
    subject: str
    course_number: str
    year: int = Field(..., ge=2000, le=2100)
    semester: str
    limit: int = Field(20, ge=1, le=48)
    sim_threshold: float = Field(1.0, ge=0.0, le=1.0)


class TopPicksHistoryItem(BaseModel):
    subject: str
    course_number: str


class TopPicksRequest(BaseModel):
    history: List[TopPicksHistoryItem] = Field(..., min_length=1)
    year: int = Field(..., ge=2000, le=2100)
    semester: str
    limit: int = Field(20, ge=1, le=48)
    decay: float = Field(0.8, ge=0.0, le=1.0)
    sim_threshold: float = Field(1.0, ge=0.0, le=1.0)


class CourseResult(BaseModel):
    subject: str
    courseNumber: str
    score: float


class RecommendResponse(BaseModel):
    count: int
    year: int
    semester: str
    results: List[CourseResult]


@router.post("/because-viewed", response_model=RecommendResponse)
def because_viewed(payload: BecauseViewedRequest):
    semester = _normalize_semester(payload.semester)
    results = recommendation_engine.recommend_because_viewed(
        subject=payload.subject,
        course_number=payload.course_number,
        year=payload.year,
        semester=semester,
        return_k=payload.limit,
        sim_threshold=payload.sim_threshold,
    )
    return RecommendResponse(
        count=len(results),
        year=payload.year,
        semester=semester,
        results=[CourseResult(**r) for r in results],
    )


@router.post("/top-picks", response_model=RecommendResponse)
def top_picks(payload: TopPicksRequest):
    semester = _normalize_semester(payload.semester)
    history = [
        {"subject": h.subject, "course_number": h.course_number} for h in payload.history
    ]
    results = recommendation_engine.recommend_top_picks(
        history=history,
        year=payload.year,
        semester=semester,
        return_k=payload.limit,
        decay=payload.decay,
        sim_threshold=payload.sim_threshold,
    )
    return RecommendResponse(
        count=len(results),
        year=payload.year,
        semester=semester,
        results=[CourseResult(**r) for r in results],
    )
