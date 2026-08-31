import hashlib
import itertools
import json
import re
from typing import Dict, List, NamedTuple, Sequence, Set

from eval.catalog import Key, split_key


class Query(NamedTuple):
    anchor: Key
    relevant: Set[Key]


class AnchorSet:
    """Anchors with a hand-written relevant set each."""

    def __init__(self, payload: Dict, universe: Sequence[Key] = ()):
        self.term = payload["term"]
        self.size = int(payload["relevant_size"])
        self.universe = set(universe)
        self.raw = payload["queries"]

        names = [q["anchor"] for q in self.raw]
        clashes = sorted({n for n in names if names.count(n) > 1})
        if clashes:
            raise ValueError(f"duplicate anchors: {', '.join(clashes)}")

        self.entries, self.dropped, self.missing = self._normalize()

    def _normalize(self):
        kept, dropped, missing = [], [], {}
        for entry in self.raw:
            anchor = entry["anchor"]
            seen, relevant = set(), []
            for course in entry["relevant"]:
                if course != anchor and course not in seen:
                    seen.add(course)
                    relevant.append(course)

            if self.universe:
                absent = [c for c in relevant if c not in self.universe]
                if anchor not in self.universe:
                    absent.append(anchor)
                if absent:
                    missing[anchor] = absent
                relevant = [c for c in relevant if c in self.universe]
                if anchor not in self.universe:
                    dropped.append((anchor, 0))
                    continue

            if len(relevant) < self.size:
                dropped.append((anchor, len(relevant)))
                continue
            kept.append(
                {
                    "anchor": anchor,
                    "relevant": relevant[: self.size],
                }
            )
        return kept, dropped, missing

    def queries(self) -> List[Query]:
        return [Query(e["anchor"], set(e["relevant"])) for e in self.entries]

    def fingerprint(self) -> str:
        payload = json.dumps(
            [[e["anchor"], e["relevant"]] for e in self.entries], sort_keys=True
        )
        return hashlib.sha256(payload.encode()).hexdigest()[:16]

    def summary(self) -> str:
        sizes = {len(q.relevant) for q in self.queries()}
        relevant = (
            f"relevant/query={sizes.pop()}"
            if len(sizes) == 1
            else f"relevant/query VARIES {sorted(sizes)}"
        )
        return (
            f"anchors={len(self.entries)} (dropped {len(self.dropped)})  "
            f"{relevant}  fingerprint={self.fingerprint()}"
        )


def load(path: str, universe: Sequence[Key] = ()) -> AnchorSet:
    with open(path) as fh:
        return AnchorSet(json.load(fh), universe)


def _numeric(key: Key):
    found = re.search(r"(\d+)", split_key(key)[1])
    return int(found.group(1)) if found else None


def _title_stem(title: str) -> str:
    text = re.sub(r"\s*\(.*?\)\s*", " ", title.lower())
    text = re.sub(r"^(advanced|graduate|honors)\s+", "", text)
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", " ", text)).strip()


def find_twins(entries, titles: Dict[Key, str]):
    """Pairs that are one course under an undergraduate and graduate number."""
    out = []
    for entry in entries:
        anchor = entry["anchor"]
        for x, y in itertools.combinations([anchor] + list(entry["relevant"]), 2):
            if split_key(x)[0] != split_key(y)[0]:
                continue
            nx, ny = _numeric(x), _numeric(y)
            if nx is None or ny is None or abs(nx - ny) != 100:
                continue
            stem = _title_stem(titles.get(x, ""))
            if stem and stem == _title_stem(titles.get(y, "")):
                out.append((anchor, x, y))
    return out


def find_near_duplicates(entries, vectors, threshold: float):
    """Relevant pairs the diversity filter would collapse into one result."""
    out = []
    for entry in entries:
        for x, y in itertools.combinations(entry["relevant"], 2):
            if x in vectors and y in vectors:
                sim = float(vectors[x] @ vectors[y])
                if sim >= threshold:
                    out.append((entry["anchor"], x, y, sim))
    return out


def _main() -> None:
    """Validate an anchors file, or list a subject's offered courses.

        python -m eval.anchors --check curated/anchors.json
        python -m eval.anchors --list-subject MCELLBI
    """
    import argparse

    import numpy as np

    from app.recommendation_engine import DEFAULT_SIM_THRESHOLD, _l2_normalize
    from eval.catalog import Catalog, key_of

    p = argparse.ArgumentParser(description=_main.__doc__)
    p.add_argument("--check")
    p.add_argument("--list-subject")
    p.add_argument("--year", type=int, default=2026)
    p.add_argument("--semester", default="Fall")
    args = p.parse_args()

    cat = Catalog(args.year, args.semester)
    universe = sorted(cat.embedded)

    if args.list_subject:
        subject = args.list_subject.upper()
        keys = [c for c in universe if split_key(c)[0] == subject]
        print(f"{subject}: {len(keys)} embedded in {args.semester} {args.year}")
        for key in keys:
            mark = " " if key in cat.offered else "*"
            print(f"  {mark} {key}")
        print("  * not printed in the schedule")
        return

    if not args.check:
        p.error("pass --check or --list-subject")

    aset = load(args.check, universe)
    titles = cat.titles()
    print(aset.summary())
    for anchor, absent in sorted(aset.missing.items()):
        print(f"  {anchor}: not in the catalog: {', '.join(absent)}")

    vectors = {}
    for d in cat.db["courseEmbeddings"].find(
        {"year": args.year, "semester": args.semester},
        {"subject": 1, "courseId": 1, "embedding": 1, "_id": 0},
    ):
        vectors[key_of(d["subject"], d["courseId"])] = _l2_normalize(
            np.array(d["embedding"], dtype="float32")
        )

    dupes = find_near_duplicates(aset.entries, vectors, DEFAULT_SIM_THRESHOLD)
    if dupes:
        print(f"  UNREACHABLE PAIRS ({len(dupes)}), only one of each is returned:")
        for anchor, x, y, sim in dupes:
            print(f"    {anchor}: {x} / {y}  cos={sim:.3f}")
    else:
        print("  no relevant pair exceeds the diversity threshold")

    twins = find_twins(aset.entries, titles)
    if twins:
        print(f"  TWINS ({len(twins)}), same course at two levels:")
        for anchor, x, y in twins:
            print(f"    {anchor}: {x} / {y}")
    else:
        print("  no undergraduate/graduate twins")

    unprinted = {
        c
        for e in aset.entries
        for c in [e["anchor"]] + e["relevant"]
        if c not in cat.offered
    }
    slots = sum(len(e["relevant"]) + 1 for e in aset.entries)
    print(f"  not printed this term: {len(unprinted)} of {slots} slots, allowed")

    single = [
        e["anchor"]
        for e in aset.entries
        if len({split_key(c)[0] for c in e["relevant"]}) == 1
    ]
    print(f"  single-subject relevant sets: {len(single)} of {len(aset.entries)}")


if __name__ == "__main__":
    _main()
