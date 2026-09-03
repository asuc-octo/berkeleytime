import os
from collections import defaultdict
from typing import Dict, Set, Tuple

from pymongo import MongoClient

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://mongodb:27017/bt")

Key = str  # "SUBJECT_NUMBER"


def key_of(subject: str, number: str) -> Key:
    return f"{subject}_{number}"


def split_key(key: Key) -> Tuple[str, str]:
    subject, _, number = key.partition("_")
    return subject, number


class Catalog:
    def __init__(self, year: int, semester: str, uri: str = MONGODB_URI):
        self.year = year
        self.semester = semester
        self.db = MongoClient(uri).get_default_database()
        self.embedded: Set[Key] = self._load_embedded()
        self.printed: Set[Key] = self._load_printed()
        self.offered: Set[Key] = self.embedded & self.printed
        self.plan_count: Dict[Key, int] = self._load_plan_counts()

    def _load_embedded(self) -> Set[Key]:
        cursor = self.db["courseEmbeddings"].find(
            {"year": self.year, "semester": self.semester},
            {"subject": 1, "courseId": 1, "_id": 0},
        )
        return {key_of(d["subject"], d["courseId"]) for d in cursor}

    def _load_printed(self) -> Set[Key]:
        """Courses with a section in the term's schedule of classes."""
        cursor = self.db["classes"].find(
            {
                "year": self.year,
                "semester": self.semester,
                "anyPrintInScheduleOfClasses": True,
            },
            {"subject": 1, "courseNumber": 1, "_id": 0},
        )
        return {key_of(d["subject"], d["courseNumber"]) for d in cursor}

    def _load_plan_counts(self) -> Dict[Key, int]:
        """How many student plans contain each course."""
        counts: Dict[Key, int] = defaultdict(int)
        for plan in self.db["plans"].find({}, {"planTerms": 1, "_id": 0}):
            seen = set()
            for term in plan.get("planTerms") or []:
                for course in term.get("courses") or []:
                    cid = course.get("courseID")
                    if cid and cid not in seen and cid in self.embedded:
                        seen.add(cid)
                        counts[cid] += 1
        return dict(counts)

    def titles(self) -> Dict[Key, str]:
        out: Dict[Key, str] = {}
        cursor = self.db["courses"].find(
            {}, {"subject": 1, "number": 1, "title": 1, "_id": 0}
        )
        for c in cursor:
            key = key_of(c["subject"], c["number"])
            out.setdefault(key, (c.get("title") or "").strip())
        return out

    def summary(self) -> str:
        return (
            f"term={self.semester} {self.year}  embedded={len(self.embedded)}  "
            f"offered={len(self.offered)}"
        )
