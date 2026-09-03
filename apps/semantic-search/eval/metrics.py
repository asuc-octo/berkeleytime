import math
from typing import Dict, List, Sequence


def recall_at_k(ranked: Sequence[str], relevant: Dict[str, float], k: int) -> float:
    """Hits over the whole relevant set, so k below its size cannot reach 1."""
    if not relevant:
        return float("nan")
    return sum(1 for c in ranked[:k] if c in relevant) / len(relevant)


def precision_at_k(ranked: Sequence[str], relevant: Dict[str, float], k: int) -> float:
    if not ranked:
        return 0.0
    return sum(1 for c in ranked[:k] if c in relevant) / k


def ndcg_at_k(ranked: Sequence[str], relevant: Dict[str, float], k: int) -> float:
    if not relevant:
        return float("nan")
    dcg = sum(relevant.get(c, 0) / math.log2(i + 2) for i, c in enumerate(ranked[:k]))
    ideal = sorted(relevant.values(), reverse=True)[:k]
    idcg = sum(rel / math.log2(i + 2) for i, rel in enumerate(ideal))
    return dcg / idcg if idcg > 0 else float("nan")


def mean(values: List[float]) -> float:
    clean = [v for v in values if not math.isnan(v)]
    return sum(clean) / len(clean) if clean else float("nan")
