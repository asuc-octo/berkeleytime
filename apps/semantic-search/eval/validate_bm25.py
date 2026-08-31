import argparse
import random

import numpy as np

from eval.catalog import Catalog
from eval.systems import BM25, load_course_texts, tokenize


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--year", type=int, default=2026)
    p.add_argument("--semester", default="Fall")
    p.add_argument("--queries", type=int, default=25)
    p.add_argument("--seed", type=int, default=0)
    args = p.parse_args()

    from rank_bm25 import BM25Okapi

    cat = Catalog(args.year, args.semester)
    texts = load_course_texts(cat.db, sorted(cat.embedded))

    mine = BM25(texts)
    reference = BM25Okapi([tokenize(texts[k]) for k in mine.keys])

    rng = random.Random(args.seed)
    worst, overlap = 0.0, []
    for anchor in rng.sample(mine.keys, min(args.queries, len(mine.keys))):
        a = mine.scores(texts[anchor])
        b = np.asarray(reference.get_scores(tokenize(texts[anchor])))
        worst = max(worst, float(np.max(np.abs(a - b))))
        top_a = [mine.keys[i] for i in np.argsort(-a)[:20]]
        top_b = [mine.keys[i] for i in np.argsort(-b)[:20]]
        overlap.append(len(set(top_a) & set(top_b)) / 20)

    print(f"corpus            {len(mine.keys)} documents")
    print(f"max |score diff|  {worst:.3e}")
    print(f"top-20 overlap    {sum(overlap) / len(overlap):.4f}")
    print("MATCH" if worst < 1e-9 else "MISMATCH")


if __name__ == "__main__":
    main()
