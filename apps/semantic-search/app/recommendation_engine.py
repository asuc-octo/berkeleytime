import logging
import os
from typing import Dict, List, Optional, Set

import numpy as np
from pymongo import MongoClient

logger = logging.getLogger("semantic-search.recommendation_engine")

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://mongodb:27017/bt")
VECTOR_SEARCH_INDEX_NAME = "course_embeddings_vector_search"

# Shared with the request models in recommendation_routes.py.
DEFAULT_RETURN_K = 20
MIN_RETURN_K = 1
# Upper bound on caller input, staying above the largest pool asked for by the backend.
MAX_RETURN_K = 200
DEFAULT_DECAY = 0.9
# Since near duplicates are skipped, search for more courses than what the pool needs.
FETCH_FACTOR = 3
# Cosine at or above this counts as a duplicate result.
DEFAULT_SIM_THRESHOLD = 0.92

_mongo_client = MongoClient(MONGODB_URI)
_embeddings_col = _mongo_client.get_default_database()["courseEmbeddings"]


def _l2_normalize(v: np.ndarray, eps: float = 1e-12) -> np.ndarray:
    n = float(np.linalg.norm(v))
    return v / n if n >= eps else v


def _fetch_embeddings(
    year: int, semester: str, pairs: List[Dict]
) -> List[Dict]:
    """Fetch stored embeddings for (subject, courseId) pairs in one term."""
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
    """Run Atlas $vectorSearch, returning results with their embeddings."""
    pipeline = [
        {
            "$vectorSearch": {
                "index": VECTOR_SEARCH_INDEX_NAME,
                "path": "embedding",
                "queryVector": query_vec.tolist(),
                "exact": True,
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
    seed_exempt_subject: Optional[str] = None,
) -> List[Dict]:
    """Exclude history/anchor courses, then apply the diversity threshold."""
    seeds = [_l2_normalize(v) for v in seed_vecs]
    picked: List[np.ndarray] = []
    results: List[Dict] = []
    for doc in raw:
        pair = (doc["subject"], doc["courseId"])
        if pair in exclude_pairs:
            continue
        v = _l2_normalize(np.array(doc["embedding"], dtype="float32"))
        if sim_threshold > 0.0:
            exempt = seed_exempt_subject is not None and doc["subject"] == seed_exempt_subject
            against = picked if exempt else seeds + picked
            if any(float(v @ h) >= sim_threshold for h in against):
                continue
        results.append({"subject": doc["subject"], "courseNumber": doc["courseId"], "score": doc["score"]})
        picked.append(v)
        if len(results) >= return_k:
            break
    return results


def recommend_because_viewed(
    subject: str,
    course_number: str,
    year: int,
    semester: str,
    return_k: int = DEFAULT_RETURN_K,
    sim_threshold: float = DEFAULT_SIM_THRESHOLD,
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

    anchor_vec = _l2_normalize(
        np.array(anchor_docs[0]["embedding"], dtype="float32")
    )
    fetch_k = return_k * FETCH_FACTOR
    raw = _vector_search(anchor_vec, year, semester, fetch_k)
    # The anchor seeds the filter so near-identical results are dropped, except
    # in its own subject where sequels are kept.
    return _post_filter(
        raw,
        {(subject, course_number)},
        [anchor_vec],
        return_k,
        sim_threshold,
        seed_exempt_subject=subject,
    )


def recommend_top_picks(
    history: List[Dict],
    year: int,
    semester: str,
    return_k: int = DEFAULT_RETURN_K,
    decay: float = DEFAULT_DECAY,
    sim_threshold: float = DEFAULT_SIM_THRESHOLD,
) -> List[Dict]:
    """Return courses based on a decay-weighted centroid of the user's course history."""
    if not history:
        return []

    docs = _fetch_embeddings(year, semester, history)
    if not docs:
        return []

    # Normalized so every history course pulls on the centroid equally.
    pair_to_emb: Dict[tuple, np.ndarray] = {
        (d["subject"], d["courseId"]): _l2_normalize(
            np.array(d["embedding"], dtype="float32")
        )
        for d in docs
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

    user_vec = _l2_normalize(np.asarray(weighted, dtype="float32"))
    fetch_k = return_k * FETCH_FACTOR
    raw = _vector_search(user_vec, year, semester, fetch_k)
    exclude_pairs = {(h["subject"], h["course_number"]) for h in history}
    return _post_filter(
        raw, exclude_pairs, list(pair_to_emb.values()), return_k, sim_threshold
    )
