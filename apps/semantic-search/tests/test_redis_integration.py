import json
import os
import sys
import unittest
from pathlib import Path

import numpy as np


sys.path.insert(0, str(Path(__file__).parents[1]))

from app.config import EmbeddingConfig  # noqa: E402
from app.engine import SemanticSearchEngine  # noqa: E402
from app.vector_store import RedisVectorStore, VectorRecord  # noqa: E402


REDIS_URL = os.getenv("SEMANTIC_SEARCH_TEST_REDIS_URI")


class FakeMiniLM:
    def get_sentence_embedding_dimension(self):
        return 384

    def encode(self, texts, **_kwargs):
        return np.ones((len(texts), 384), dtype="float32")


def test_config():
    return EmbeddingConfig(
        profile="minilm-integration",
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_revision="integration-test",
        query_prefix="",
        vector_algorithm="flat",
        batch_size=128,
    )


def catalog(size):
    return [
        {
            "subject": f"SUBJ{index // 1000}",
            "number": str(index),
            "courseNumber": str(index),
            "course": {"title": f"Course {index}", "description": "Description"},
        }
        for index in range(size)
    ]


@unittest.skipUnless(REDIS_URL, "set SEMANTIC_SEARCH_TEST_REDIS_URI to run Redis integration tests")
class RedisIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.store = RedisVectorStore(REDIS_URL)
        self.store._redis.flushdb()

    def tearDown(self):
        self.store._redis.flushdb()

    def engine(self):
        return SemanticSearchEngine(
            model=FakeMiniLM(),
            vector_store=self.store,
            embedding_config=test_config(),
        )

    def test_fresh_build_and_restart_reuse(self):
        engine = self.engine()
        engine._fetch_courses = lambda _year, _semester: catalog(8)
        built = engine.refresh(2026, "Fall")

        restarted = self.engine()
        loaded = restarted._load_vector_index(2026, "Fall", None)

        self.assertEqual(built.size, 8)
        self.assertIsNotNone(loaded)
        self.assertEqual(loaded.size, 8)

    def test_legacy_migration_does_not_touch_unrelated_keys(self):
        legacy_name = "semantic_search:2025:Fall:all"
        legacy = self.store.create_index(legacy_name, 384, "flat")
        self.store.load_batch(
            legacy,
            [VectorRecord("COMPSCI", "61A", np.ones(384, dtype="float32"))],
        )
        legacy_meta = f"semantic_search:meta:{legacy_name}"
        self.store._redis.set(legacy_meta, json.dumps({"year": 2025, "semester": "Fall"}))
        self.store._redis.set("unrelated:key", "keep")

        removed = self.store.purge_legacy_indexes()

        self.assertEqual(removed, 1)
        self.assertIsNone(self.store.open_index(legacy_name, 384, "flat"))
        self.assertEqual(self.store._redis.get("unrelated:key"), "keep")

    def test_two_full_terms_fit_below_redis_memory_limit(self):
        engine = self.engine()
        engine._fetch_courses = lambda _year, _semester: catalog(4548)

        engine.refresh(2026, "Fall")
        engine.refresh(2026, "Spring")

        memory = self.store._redis.info("memory")
        self.assertEqual(len(engine.describe_indices()), 2)
        self.assertLess(int(memory["used_memory"]), 140 * 1024 * 1024)
        self.assertLessEqual(int(memory["used_memory"]), int(memory["maxmemory"]))


if __name__ == "__main__":
    unittest.main()
