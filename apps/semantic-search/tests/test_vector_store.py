import fnmatch
import sys
import unittest
from pathlib import Path


sys.path.insert(0, str(Path(__file__).parents[1]))

from app.vector_store import RedisVectorStore  # noqa: E402


class FakeRedis:
    def __init__(self, keys):
        self.keys = set(keys)
        self.commands = []
        self.deleted = []

    def scan_iter(self, match, count):
        del count
        return [key for key in self.keys if fnmatch.fnmatch(key, match)]

    def execute_command(self, *command):
        self.commands.append(command)

    def delete(self, key):
        self.deleted.append(key)
        self.keys.discard(key)


class RedisVectorStoreTests(unittest.TestCase):
    def test_schema_contains_only_identifiers_and_embedding(self):
        schema = RedisVectorStore._schema("index", 384, "flat")

        self.assertEqual(
            [field["name"] for field in schema["fields"]],
            ["subject", "course_number", "embedding"],
        )
        self.assertEqual(schema["fields"][-1]["attrs"]["dims"], 384)

    def test_legacy_purge_only_uses_legacy_metadata_namespace(self):
        legacy_key = "semantic_search:meta:semantic_search:2026:Fall:all"
        current_key = "semantic_search:v2:minilm:meta:semantic_search:v2:minilm:index:2026:Fall:all"
        unrelated_key = "another_service:meta:semantic_search:2026:Fall:all"
        fake_redis = FakeRedis({legacy_key, current_key, unrelated_key})
        store = RedisVectorStore.__new__(RedisVectorStore)
        store._redis = fake_redis

        removed = store.purge_legacy_indexes()

        self.assertEqual(removed, 1)
        self.assertEqual(
            fake_redis.commands,
            [("FT.DROPINDEX", "semantic_search:2026:Fall:all", "DD")],
        )
        self.assertEqual(fake_redis.deleted, [legacy_key])
        self.assertIn(current_key, fake_redis.keys)
        self.assertIn(unrelated_key, fake_redis.keys)


if __name__ == "__main__":
    unittest.main()
