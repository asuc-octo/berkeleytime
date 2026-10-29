import importlib.util
import math
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("run_baseline.py")
SPEC = importlib.util.spec_from_file_location("run_baseline", MODULE_PATH)
assert SPEC and SPEC.loader
run_baseline = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(run_baseline)


class BaselineMetricsTest(unittest.TestCase):
    def test_relevance_metrics_use_rank_and_unique_relevant_courses(self) -> None:
        metrics = run_baseline.relevance_metrics(
            ["COURSE A", "COURSE B", "COURSE B", "COURSE C"],
            {"COURSE B", "COURSE D"},
            4,
        )

        self.assertEqual(metrics["recall_at_4"], 0.5)
        self.assertEqual(metrics["mrr_at_4"], 0.5)
        expected_dcg = 1 / math.log2(3)
        ideal_dcg = 1 + 1 / math.log2(3)
        self.assertAlmostEqual(metrics["ndcg_at_4"], expected_dcg / ideal_dcg)

    def test_percentile_uses_nearest_rank(self) -> None:
        self.assertEqual(run_baseline.percentile([1, 2, 3, 4], 0.95), 4)
        self.assertEqual(run_baseline.percentile([], 0.95), 0.0)


if __name__ == "__main__":
    unittest.main()
