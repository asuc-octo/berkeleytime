import logging
import os
from typing import Dict, List, Optional, Set

import numpy as np
from pymongo import MongoClient

logger = logging.getLogger("semantic-search.recommendation_engine")

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://mongodb:27017/bt")
VECTOR_SEARCH_INDEX_NAME = "course_embeddings_vector_search"

_mongo_client = MongoClient(MONGODB_URI)
_embeddings_col = _mongo_client.get_default_database()["courseEmbeddings"]
_classes_col = _mongo_client.get_default_database()["classes"]


def _filter_raw_to_catalog(raw: List[Dict], year: int, semester: str) -> List[Dict]:
    """Filter raw vector search docs to only those in the schedule of classes for the term.

    Applies before diversity filtering so the full pool of valid-catalog courses
    is available. Uses classes.courseNumber (= courseEmbeddings.courseId) and subject.
    """
    if not raw:
        return []
    valid: Set[tuple] = set()
    cursor = _classes_col.find(
        {
            "year": year,
            "semester": semester,
            "anyPrintInScheduleOfClasses": True,
            "$or": [
                {"subject": doc["subject"], "courseNumber": doc["courseId"]}
                for doc in raw
            ],
        },
        {"subject": 1, "courseNumber": 1, "_id": 0},
    )
    for doc in cursor:
        valid.add((doc["subject"], doc["courseNumber"]))
    return [doc for doc in raw if (doc["subject"], doc["courseId"]) in valid]


def _l2_normalize(v: np.ndarray, eps: float = 1e-12) -> np.ndarray:
    n = float(np.linalg.norm(v))
    return v / n if n >= eps else v


def _fetch_embeddings(
    year: int, semester: str, pairs: List[Dict]
) -> List[Dict]:
    """Fetch stored embeddings for the given (subject, courseId) pairs in a specific term.

    Each element of `pairs` must have 'subject' and 'course_number' keys.
    Filters by both subject and courseId to avoid cross-subject collisions where
    multiple subjects share the same course number (e.g. STAT 134 vs ECON 134).
    """
    if not pairs:
        return []
    cursor = _embeddings_col.find(
        {
            "year": year,
            "semester": semester,
            "$or": [
                {"subject": p["subject"], "courseId": p["course_number"]} for p in pairs
            ],
        },
        {"courseId": 1, "subject": 1, "embedding": 1, "_id": 0},
    )
    return list(cursor)


def _vector_search(
    query_vec: np.ndarray,
    year: int,
    semester: str,
    fetch_k: int,
) -> List[Dict]:
    """Run Atlas $vectorSearch for the given query vector, returning results with embeddings."""
    pipeline = [
        {
            "$vectorSearch": {
                "index": VECTOR_SEARCH_INDEX_NAME,
                "path": "embedding",
                "queryVector": query_vec.tolist(),
                "numCandidates": min(fetch_k * 10, 2000),
                "limit": fetch_k,
                "filter": {"year": year, "semester": semester},
            }
        },
        {
            "$project": {
                "courseId": 1,
                "subject": 1,
                "embedding": 1,
                "score": {"$meta": "vectorSearchScore"},
                "_id": 0,
            }
        },
    ]
    try:
        return list(_embeddings_col.aggregate(pipeline))
    except Exception as exc:
        logger.error("$vectorSearch failed: %s", exc)
        return []


def _post_filter(
    raw: List[Dict],
    exclude_pairs: Set[tuple],
    seed_vecs: List[np.ndarray],
    return_k: int,
    sim_threshold: float,
) -> List[Dict]:
    """Exclude history/anchor courses by (subject, courseId), apply diversity threshold."""
    seen_vecs = list(seed_vecs)
    results: List[Dict] = []
    for doc in raw:
        pair = (doc["subject"], doc["courseId"])
        if pair in exclude_pairs:
            continue
        v = np.array(doc["embedding"], dtype="float32")
        if sim_threshold > 0.0 and seen_vecs:
            if any(float(v @ h) >= sim_threshold for h in seen_vecs):
                continue
        results.append({"subject": doc["subject"], "courseNumber": doc["courseId"], "score": doc["score"]})
        seen_vecs.append(v)
        if len(results) >= return_k:
            break
    return results


def recommend_because_viewed(
    subject: str,
    course_number: str,
    year: int,
    semester: str,
    return_k: int = 20,
    sim_threshold: float = 1.0,
) -> List[Dict]:
    """Return courses semantically similar to a single anchor course."""
    anchor_docs = _fetch_embeddings(
        year, semester, [{"subject": subject, "course_number": course_number}]
    )
    if not anchor_docs:
        logger.warning(
            "No embedding found for %s %s in %s %d", subject, course_number, semester, year
        )
        return []

    anchor_vec = np.array(anchor_docs[0]["embedding"], dtype="float32")
    fetch_k = return_k * 5
    raw = _vector_search(anchor_vec, year, semester, fetch_k)
    raw = _filter_raw_to_catalog(raw, year, semester)
    # seed_vecs starts empty so diversity only applies between selected results,
    # not between results and the anchor.  The anchor is excluded via exclude_pairs.
    return _post_filter(raw, {(subject, course_number)}, [], return_k, sim_threshold)


def recommend_top_picks(
    history: List[Dict],
    year: int,
    semester: str,
    return_k: int = 20,
    decay: float = 0.8,
    sim_threshold: float = 1.0,
) -> List[Dict]:
    """Return courses based on a decay-weighted centroid of the user's course history."""
    if not history:
        return []

    docs = _fetch_embeddings(year, semester, history)
    if not docs:
        return []

    # Key by (subject, courseId) to avoid cross-subject collisions
    pair_to_emb: Dict[tuple, np.ndarray] = {
        (d["subject"], d["courseId"]): np.array(d["embedding"], dtype="float32") for d in docs
    }

    weighted: Optional[np.ndarray] = None
    w_sum = 0.0
    for i, h in enumerate(history):
        key = (h["subject"], h["course_number"])
        if key not in pair_to_emb:
            continue
        w = float(decay) ** i
        v = pair_to_emb[key]
        weighted = v * w if weighted is None else weighted + v * w
        w_sum += w

    if weighted is None or w_sum == 0.0:
        return []

    user_vec = _l2_normalize(np.asarray(weighted / w_sum, dtype="float32"))
    fetch_k = return_k * 5
    raw = _vector_search(user_vec, year, semester, fetch_k)
    raw = _filter_raw_to_catalog(raw, year, semester)
    exclude_pairs = {(h["subject"], h["course_number"]) for h in history}
    return _post_filter(
        raw, exclude_pairs, list(pair_to_emb.values()), return_k, sim_threshold
    )
