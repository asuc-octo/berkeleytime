import argparse
import json
import random
from typing import Dict, List

from eval import anchors as anchormod
from eval.catalog import Catalog, split_key
from eval.metrics import mean, ndcg_at_k, precision_at_k, recall_at_k
from eval.systems import (
    BM25System,
    Filtered,
    Popularity,
    Random,
    RawRetrieval,
    SameSubject,
    load_course_texts,
)

BOOTSTRAP_SAMPLES = 1000
DEFAULT_ANCHORS = "/app/eval/curated/anchors.json"


def bootstrap_ci(values: List[float], samples: int, seed: int):
    """Percentile CI, resampling anchors."""
    if not values:
        return float("nan"), float("nan")
    rng = random.Random(seed)
    n = len(values)
    means = []
    for _ in range(samples):
        means.append(sum(values[rng.randrange(n)] for _ in range(n)) / n)
    means.sort()
    return means[int(0.025 * samples)], means[int(0.975 * samples)]


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--anchors", default=DEFAULT_ANCHORS)
    p.add_argument("--year", type=int, default=2026)
    p.add_argument("--semester", default="Fall")
    p.add_argument("--k", type=int, default=20)
    p.add_argument("--ks", type=int, nargs="+", default=[4, 20])
    p.add_argument("--reference", default="bm25")
    p.add_argument("--seed", type=int, default=20260805)
    p.add_argument("--json", help="write the full report here")
    args = p.parse_args()

    cat = Catalog(args.year, args.semester)
    universe = sorted(cat.embedded)
    anchor_set = anchormod.load(args.anchors, universe)
    print(cat.summary())
    print(anchor_set.summary())
    if anchor_set.dropped:
        print(f"  dropped: {anchor_set.dropped}")

    queries = anchor_set.queries()
    if not queries:
        raise SystemExit("no queries; check the anchors file")

    texts = load_course_texts(cat.db, universe)
    systems = [
        Filtered(args.year, args.semester),
        RawRetrieval(args.year, args.semester),
        BM25System(texts),
        SameSubject(universe, cat.plan_count),
        Popularity(universe, cat.plan_count),
        Random(universe, args.seed),
    ]

    report: Dict[str, Dict] = {}
    primary_scores: Dict[str, List[float]] = {}
    primary = f"recall@{args.k}"

    for system in systems:
        rows: List[Dict] = []
        own_subject, within, cross = [], [], []

        for query in queries:
            labels = {c: 1.0 for c in query.relevant}
            ranked = system.rank(query.anchor, args.k)
            row = {}
            for k in args.ks:
                row[f"recall@{k}"] = recall_at_k(ranked, labels, k)
                row[f"ndcg@{k}"] = ndcg_at_k(ranked, labels, k)
                row[f"precision@{k}"] = precision_at_k(ranked, labels, k)
            row[primary] = recall_at_k(ranked, labels, args.k)
            rows.append(row)

            subject = split_key(query.anchor)[0]
            top = ranked[: args.ks[0]]
            if top:
                own_subject.append(
                    sum(1 for c in top if split_key(c)[0] == subject) / len(top)
                )
            same = {c for c in query.relevant if split_key(c)[0] == subject}
            diff = query.relevant - same
            hits = set(ranked[: args.k])
            if same:
                within.append(len(hits & same) / len(same))
            if diff:
                cross.append(len(hits & diff) / len(diff))

        scores = [r[primary] for r in rows]
        lo, hi = bootstrap_ci(scores, BOOTSTRAP_SAMPLES, args.seed)
        report[system.name] = {
            **{name: mean([r[name] for r in rows]) for name in rows[0]},
            f"{primary}_ci": [lo, hi],
            "subject_concentration": mean(own_subject),
            "recall_within_subject": mean(within),
            "recall_cross_subject": mean(cross),
        }
        primary_scores[system.name] = scores

    cols = [f"{m}@{k}" for k in args.ks for m in ("recall", "ndcg", "precision")]
    width = max(len(c) for c in cols) + 2
    print("\n  " + "system".ljust(14) + "".join(c.rjust(width) for c in cols))
    for name, row in report.items():
        print("  " + name.ljust(14) + "".join(f"{row[c]:.4f}".rjust(width) for c in cols))

    print(f"\n  {primary} with 95% CI over {len(queries)} anchors")
    for name, row in report.items():
        lo, hi = row[f"{primary}_ci"]
        print(f"    {name.ljust(14)} {row[primary]:.4f}  [{lo:.4f}, {hi:.4f}]")

    if args.reference in primary_scores:
        ref = primary_scores[args.reference]
        print(f"\n  paired vs {args.reference}, 95% CI on {primary}")
        for name, scores in primary_scores.items():
            if name == args.reference:
                continue
            diffs = [a - b for a, b in zip(scores, ref)]
            lo, hi = bootstrap_ci(diffs, BOOTSTRAP_SAMPLES, args.seed)
            verdict = "flat" if lo <= 0 <= hi else ("better" if lo > 0 else "worse")
            print(f"    {name.ljust(14)} {mean(diffs):+.4f}  [{lo:+.4f}, {hi:+.4f}]  {verdict}")

    print("\n  diagnostics")
    for name, row in report.items():
        print(
            f"    {name.ljust(14)} subject concentration {row['subject_concentration']:.3f}"
            f"   recall within-subject {row['recall_within_subject']:.3f}"
            f"   cross-subject {row['recall_cross_subject']:.3f}"
        )

    if args.json:
        with open(args.json, "w") as fh:
            json.dump(
                {
                    "config": vars(args),
                    "fingerprint": anchor_set.fingerprint(),
                    "systems": report,
                },
                fh,
                indent=2,
            )
        print(f"\nwrote {args.json}")


if __name__ == "__main__":
    main()
