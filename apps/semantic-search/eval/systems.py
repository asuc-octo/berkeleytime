import math
import random
import re
from collections import defaultdict
from typing import Dict, List, Sequence

import numpy as np

from app import recommendation_engine as engine
from eval.catalog import Key, key_of, split_key

# Okapi defaults, matching rank_bm25.
BM25_K1 = 1.5
BM25_B = 0.75
BM25_EPSILON = 0.25

_TOKEN = re.compile(r"[a-z0-9]+")


def tokenize(text: str) -> List[str]:
    return _TOKEN.findall(text.lower())


def build_course_text(course: Dict) -> str:
    """Mirror of SemanticSearchEngine._build_course_text."""
    subject = (course.get("subject") or "").strip()
    number = course.get("number", "")
    title = (course.get("title") or "").strip()
    desc = (course.get("description") or "").strip()
    org = (course.get("academicOrganizationName") or "").strip()

    parts = [f"{subject} {number}: {title}."]
    if org:
        parts.append(f"Offered by the {org} department.")
    if desc:
        parts.append(desc)
    return " ".join(parts)


def load_course_texts(db, keys: Sequence[Key]) -> Dict[Key, str]:
    wanted = set(keys)
    out: Dict[Key, str] = {}
    cursor = db["courses"].find(
        {},
        {
            "subject": 1,
            "number": 1,
            "title": 1,
            "description": 1,
            "academicOrganizationName": 1,
            "_id": 0,
        },
    )
    for c in cursor:
        key = key_of(c["subject"], c["number"])
        if key in wanted and key not in out:
            out[key] = build_course_text(c)
    return out


class BM25:
    """Okapi BM25 over an inverted index. validate_bm25.py checks it."""

    def __init__(self, docs: Dict[Key, str]):
        self.keys: List[Key] = list(docs)
        tokenized = [tokenize(docs[k]) for k in self.keys]
        self.doc_len = [len(t) for t in tokenized]
        self.avgdl = sum(self.doc_len) / len(self.doc_len) if self.doc_len else 0.0
        self.n = len(self.keys)

        self.postings: Dict[str, List[tuple]] = defaultdict(list)
        for idx, tokens in enumerate(tokenized):
            freqs: Dict[str, int] = defaultdict(int)
            for token in tokens:
                freqs[token] += 1
            for token, tf in freqs.items():
                self.postings[token].append((idx, tf))

        idfs, negatives, total = {}, [], 0.0
        for token, posting in self.postings.items():
            df = len(posting)
            idf = math.log(self.n - df + 0.5) - math.log(df + 0.5)
            idfs[token] = idf
            total += idf
            if idf < 0:
                negatives.append(token)
        average = total / len(idfs) if idfs else 0.0
        for token in negatives:
            idfs[token] = BM25_EPSILON * average
        self.idf = idfs

    def scores(self, query: str) -> np.ndarray:
        out = np.zeros(self.n)
        for token in tokenize(query):
            idf = self.idf.get(token)
            if idf is None:
                continue
            for idx, tf in self.postings[token]:
                denom = tf + BM25_K1 * (
                    1 - BM25_B + BM25_B * self.doc_len[idx] / self.avgdl
                )
                out[idx] += idf * tf * (BM25_K1 + 1) / denom
        return out


class BaseSystem:
    name = "base"

    def rank(self, anchor: Key, k: int) -> List[Key]:
        raise NotImplementedError


class RawRetrieval(BaseSystem):
    """Vector search alone, without the diversity filter."""

    name = "raw-enn"

    def __init__(self, year: int, semester: str):
        self.year, self.semester = year, semester

    def rank(self, anchor: Key, k: int) -> List[Key]:
        subject, number = split_key(anchor)
        docs = engine._fetch_embeddings(
            self.year, self.semester, [{"subject": subject, "course_number": number}]
        )
        if not docs:
            return []
        vec = engine._l2_normalize(np.array(docs[0]["embedding"], dtype="float32"))
        raw = engine._vector_search(vec, self.year, self.semester, k + 5)
        out = [key_of(d["subject"], d["courseId"]) for d in raw]
        return [c for c in out if c != anchor][:k]


class Filtered(BaseSystem):
    """Vector search plus the Python diversity filter."""

    name = "enn-filtered"

    def __init__(self, year: int, semester: str):
        self.year, self.semester = year, semester

    def rank(self, anchor: Key, k: int) -> List[Key]:
        subject, number = split_key(anchor)
        results = engine.recommend_because_viewed(
            subject=subject,
            course_number=number,
            year=self.year,
            semester=self.semester,
            return_k=k,
        )
        return [key_of(r["subject"], r["courseNumber"]) for r in results]


class BM25System(BaseSystem):
    name = "bm25"

    def __init__(self, texts: Dict[Key, str]):
        self.texts = texts
        self.index = BM25(texts)

    def rank(self, anchor: Key, k: int) -> List[Key]:
        query = self.texts.get(anchor)
        if not query:
            return []
        scores = self.index.scores(query)
        out = []
        for idx in np.argsort(-scores):
            key = self.index.keys[idx]
            if key == anchor or scores[idx] <= 0:
                continue
            out.append(key)
            if len(out) >= k:
                break
        return out


class SameSubject(BaseSystem):
    """The anchor's own subject, most planned first."""

    name = "same-subject"

    def __init__(self, universe: Sequence[Key], plan_count: Dict[Key, int]):
        self.by_subject: Dict[str, List[Key]] = defaultdict(list)
        for key in sorted(universe, key=lambda c: (-plan_count.get(c, 0), c)):
            self.by_subject[split_key(key)[0]].append(key)

    def rank(self, anchor: Key, k: int) -> List[Key]:
        subject = split_key(anchor)[0]
        return [c for c in self.by_subject.get(subject, []) if c != anchor][:k]


class Popularity(BaseSystem):
    """Most planned courses overall, ignoring the anchor."""

    name = "popularity"

    def __init__(self, universe: Sequence[Key], plan_count: Dict[Key, int]):
        self.ranked = sorted(universe, key=lambda c: (-plan_count.get(c, 0), c))

    def rank(self, anchor: Key, k: int) -> List[Key]:
        return [c for c in self.ranked if c != anchor][:k]


class Random(BaseSystem):
    name = "random"

    def __init__(self, universe: Sequence[Key], seed: int = 0):
        self.universe = sorted(universe)
        self.seed = seed

    def rank(self, anchor: Key, k: int) -> List[Key]:
        rng = random.Random(f"{self.seed}:{anchor}")
        pool = [c for c in self.universe if c != anchor]
        return rng.sample(pool, min(k, len(pool)))
