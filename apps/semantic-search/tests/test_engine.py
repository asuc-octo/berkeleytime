import fnmatch
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

import numpy as np


sys.path.insert(0, str(Path(__file__).parents[1]))

from app.config import EmbeddingConfig  # noqa: E402
from app.engine import SemanticSearchEngine  # noqa: E402
from app.vector_store import VectorMatch  # noqa: E402


class FakeModel:
    def __init__(self, dimensions=384, fail_on_call=None):
        self.dimensions = dimensions
        self.fail_on_call = fail_on_call
        self.batch_sizes = []

    def get_sentence_embedding_dimension(self):
        return self.dimensions

    def encode(self, texts, **_kwargs):
        self.batch_sizes.append(len(texts))
        if self.fail_on_call == len(self.batch_sizes):
            raise RuntimeError("interrupted build")
        return np.ones((len(texts), self.dimensions), dtype="float32")


class FakeIndex:
    def __init__(self, name):
        self.name = name
        self.records = []
        self.matches = []

    def search(self, _vector, limit):
        return self.matches[:limit]


class FakeVectorStore:
    backend_name = "fake"

    def __init__(self):
        self.indices = {}
        self.metadata = {}
        self.deleted = []
        self.purge_calls = 0
        self.stale_purge_calls = []

    def create_index(self, name, _dimensions, _algorithm):
        index = FakeIndex(name)
        self.indices[name] = index
        return index

    def open_index(self, name, _dimensions, _algorithm):
        return self.indices.get(name)

    def load_batch(self, index, records):
        index.records.extend(records)

    def delete_index(self, name):
        self.deleted.append(name)
        self.indices.pop(name, None)

    def get_metadata(self, key):
        return self.metadata.get(key)

    def set_metadata(self, key, value):
        self.metadata[key] = dict(value)

    def delete_metadata(self, key):
        self.metadata.pop(key, None)

    def scan_metadata(self, pattern):
        return [
            {**value, "_meta_key": key}
            for key, value in self.metadata.items()
            if fnmatch.fnmatch(key, pattern)
        ]

    def purge_legacy_indexes(self):
        self.purge_calls += 1
        return 2

    def purge_stale_indexes(self, active_prefix):
        self.stale_purge_calls.append(active_prefix)
        return 1


def config(batch_size=2):
    return EmbeddingConfig(
        profile="minilm-test",
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_revision="test-revision",
        query_prefix="",
        vector_algorithm="flat",
        batch_size=batch_size,
    )


def courses(count=5):
    return [
        {
            "subject": "COMPSCI",
            "number": str(index),
            "courseNumber": str(index),
            "course": {"title": f"Course {index}", "description": "Description"},
        }
        for index in range(count)
    ]


class SemanticSearchEngineTests(unittest.TestCase):
    def make_engine(self, model=None, store=None):
        return SemanticSearchEngine(
            model=model or FakeModel(),
            vector_store=store or FakeVectorStore(),
            embedding_config=config(),
        )

    def test_refresh_encodes_and_loads_in_bounded_batches(self):
        model = FakeModel()
        store = FakeVectorStore()
        engine = self.make_engine(model, store)
        engine._fetch_courses = lambda _year, _semester: courses()

        entry = engine.refresh(2026, "Fall")

        self.assertEqual(model.batch_sizes, [2, 2, 1])
        self.assertEqual(entry.size, 5)
        self.assertEqual(len(entry.index.records), 5)
        self.assertEqual(
            set(vars(entry.index.records[0])),
            {"subject", "course_number", "embedding"},
        )

    def test_course_text_uses_course_number_not_class_number(self):
        text = SemanticSearchEngine._build_course_text(
            {
                "subject": "COMPSCI",
                "courseNumber": "61A",
                "number": "001",
                "course": {"title": "SICP", "description": "Programming"},
            }
        )

        self.assertIn("NUMBER: 61A", text)
        self.assertNotIn("NUMBER: 001", text)

    def test_compatible_index_is_reused_after_restart(self):
        store = FakeVectorStore()
        first = self.make_engine(FakeModel(), store)
        first._fetch_courses = lambda _year, _semester: courses(1)
        first.refresh(2026, "Fall")

        restarted = self.make_engine(FakeModel(), store)
        loaded = restarted._load_vector_index(2026, "Fall", None)

        self.assertIsNotNone(loaded)
        self.assertEqual(loaded.size, 1)

    def test_interrupted_build_has_no_metadata_and_is_rebuilt(self):
        store = FakeVectorStore()
        interrupted = self.make_engine(FakeModel(fail_on_call=2), store)
        interrupted._fetch_courses = lambda _year, _semester: courses(3)

        with self.assertRaisesRegex(RuntimeError, "interrupted build"):
            interrupted.refresh(2026, "Fall")
        self.assertEqual(store.metadata, {})

        recovered = self.make_engine(FakeModel(), store)
        self.assertIsNone(recovered._load_vector_index(2026, "Fall", None))
        recovered._fetch_courses = lambda _year, _semester: courses(3)
        entry = recovered.refresh(2026, "Fall")
        self.assertEqual(entry.size, 3)

    def test_search_contract_is_independent_of_vector_store(self):
        engine = self.make_engine()
        engine._fetch_courses = lambda _year, _semester: courses(1)
        entry = engine.refresh(2026, "Fall")
        entry.index.matches = [VectorMatch(0.1, "COMPSCI", "61A")]

        results, _ = engine.search("intro programming", 2026, "Fall")

        self.assertEqual(results, [{"subject": "COMPSCI", "courseNumber": "61A"}])

    def test_legacy_migration_is_scoped_and_runs_once(self):
        store = FakeVectorStore()
        engine = self.make_engine(FakeModel(), store)
        engine.fetch_available_terms = lambda: []

        with patch("app.engine.PURGE_LEGACY_INDEXES", True):
            engine.build_startup_indexes()
            engine.build_startup_indexes()

        self.assertEqual(store.purge_calls, 1)
        self.assertEqual(engine.describe_configuration()["legacy_indexes_removed"], 2)

    def test_stale_indexes_are_purged_only_after_current_index_is_ready(self):
        store = FakeVectorStore()
        engine = self.make_engine(FakeModel(), store)
        engine._fetch_courses = lambda _year, _semester: courses(1)

        with patch("app.engine.PURGE_LEGACY_INDEXES", True):
            engine.refresh(2026, "Fall")
            engine.refresh(2026, "Fall")

        self.assertEqual(store.stale_purge_calls, [engine._index_prefix])
        self.assertEqual(engine.describe_configuration()["stale_indexes_removed"], 1)


if __name__ == "__main__":
    unittest.main()
