import json
import sys
import threading
import types
import unittest
from pathlib import Path
from unittest.mock import Mock


semantic_search_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(semantic_search_root))


redis_module = types.ModuleType("redis")
redis_module.from_url = Mock()
sys.modules.setdefault("redis", redis_module)

redisvl_module = types.ModuleType("redisvl")
redisvl_index_module = types.ModuleType("redisvl.index")
redisvl_query_module = types.ModuleType("redisvl.query")
redisvl_redis_module = types.ModuleType("redisvl.redis")
redisvl_utils_module = types.ModuleType("redisvl.redis.utils")
redisvl_index_module.SearchIndex = object
redisvl_query_module.VectorQuery = object
redisvl_utils_module.array_to_buffer = Mock()
sys.modules.setdefault("redisvl", redisvl_module)
sys.modules.setdefault("redisvl.index", redisvl_index_module)
sys.modules.setdefault("redisvl.query", redisvl_query_module)
sys.modules.setdefault("redisvl.redis", redisvl_redis_module)
sys.modules.setdefault("redisvl.redis.utils", redisvl_utils_module)

sentence_transformers_module = types.ModuleType("sentence_transformers")
sentence_transformers_module.SentenceTransformer = object
sys.modules.setdefault("sentence_transformers", sentence_transformers_module)

from app import engine as engine_module


class FakeRedis:
    def __init__(self, metadata):
        self.metadata = metadata
        self.deleted = []

    def scan(self, _cursor, match=None, count=None):
        return 0, list(self.metadata)

    def get(self, key):
        value = self.metadata.get(key)
        return json.dumps(value) if value is not None else None

    def delete(self, key):
        self.deleted.append(key)


class FakeSearchIndex:
    deleted_names = []

    def __init__(self, name):
        self.name = name

    @classmethod
    def from_dict(cls, schema, redis_url=None):
        return cls(schema["index"]["name"])

    def exists(self):
        return True

    def delete(self, drop=False):
        self.deleted_names.append(self.name)


def bare_engine():
    engine = engine_module.SemanticSearchEngine.__new__(
        engine_module.SemanticSearchEngine
    )
    engine._indices = {}
    engine._lock = threading.RLock()
    engine._embedding_dims = 3
    engine.default_allowed_subjects = None
    return engine


class SemanticSearchSecurityTests(unittest.TestCase):
    def setUp(self):
        self.original_search_index = engine_module.SearchIndex
        engine_module.SearchIndex = FakeSearchIndex
        FakeSearchIndex.deleted_names = []

    def tearDown(self):
        engine_module.SearchIndex = self.original_search_index

    def test_missing_index_does_not_start_a_background_build(self):
        engine = bare_engine()
        engine._load_redis_index = Mock(return_value=None)
        engine.refresh_async = Mock()

        with self.assertRaisesRegex(RuntimeError, "not available"):
            engine._get_or_build_index(2026, "Fall", ["COMPSCI"])

        engine.refresh_async.assert_not_called()

    def test_filtered_indexes_cannot_crowd_out_production_term_indexes(self):
        metadata = {
            "semantic_search:meta:filtered-cs": {
                "year": 2026,
                "semester": "Fall",
                "allowed_subjects": ["COMPSCI"],
            },
            "semantic_search:meta:filtered-data": {
                "year": 2026,
                "semester": "Fall",
                "allowed_subjects": ["DATA"],
            },
            "semantic_search:meta:production-current": {
                "year": 2026,
                "semester": "Fall",
                "allowed_subjects": None,
            },
            "semantic_search:meta:production-previous": {
                "year": 2026,
                "semester": "Spring",
                "allowed_subjects": None,
            },
        }
        engine = bare_engine()
        engine._redis = FakeRedis(metadata)

        engine._evict_old_indexes(max_terms=2)

        self.assertEqual(engine._redis.deleted, [])
        self.assertEqual(FakeSearchIndex.deleted_names, [])

    def test_eviction_still_removes_indexes_older_than_retained_terms(self):
        metadata = {
            "semantic_search:meta:current": {
                "year": 2026,
                "semester": "Fall",
                "allowed_subjects": None,
            },
            "semantic_search:meta:previous": {
                "year": 2026,
                "semester": "Spring",
                "allowed_subjects": None,
            },
            "semantic_search:meta:old-filtered": {
                "year": 2025,
                "semester": "Fall",
                "allowed_subjects": ["COMPSCI"],
            },
        }
        engine = bare_engine()
        engine._redis = FakeRedis(metadata)

        engine._evict_old_indexes(max_terms=2)

        self.assertEqual(
            engine._redis.deleted, ["semantic_search:meta:old-filtered"]
        )
        self.assertEqual(
            FakeSearchIndex.deleted_names,
            ["semantic_search:2025:Fall:COMPSCI"],
        )


if __name__ == "__main__":
    unittest.main()
