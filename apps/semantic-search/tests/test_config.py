import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch


sys.path.insert(0, str(Path(__file__).parents[1]))

from app.config import (  # noqa: E402
    MINILM_MODEL_NAME,
    MINILM_MODEL_REVISION,
    EmbeddingConfig,
    load_embedding_config,
)


CONFIG_ENV = {
    "SEMANTIC_SEARCH_MODEL",
    "SEMANTIC_SEARCH_MODEL_REVISION",
    "SEMANTIC_SEARCH_QUERY_PREFIX",
    "SEMANTIC_SEARCH_VECTOR_ALGORITHM",
    "SEMANTIC_SEARCH_EMBEDDING_PROFILE",
    "SEMANTIC_SEARCH_EMBEDDING_BATCH_SIZE",
}


class EmbeddingConfigTests(unittest.TestCase):
    def load_with(self, **values):
        environment = {key: value for key, value in os.environ.items() if key not in CONFIG_ENV}
        environment.update(values)
        with patch.dict(os.environ, environment, clear=True):
            return load_embedding_config()

    def test_defaults_to_pinned_minilm_flat_profile(self):
        config = self.load_with()

        self.assertEqual(config.model_name, MINILM_MODEL_NAME)
        self.assertEqual(config.model_revision, MINILM_MODEL_REVISION)
        self.assertEqual(config.vector_algorithm, "flat")
        self.assertEqual(config.query_prefix, "")
        self.assertEqual(config.batch_size, 128)

    def test_bge_override_receives_retrieval_prefix(self):
        config = self.load_with(
            SEMANTIC_SEARCH_MODEL="BAAI/bge-base-en-v1.5",
            SEMANTIC_SEARCH_VECTOR_ALGORITHM="hnsw",
        )

        self.assertIsNone(config.model_revision)
        self.assertEqual(config.vector_algorithm, "hnsw")
        self.assertTrue(config.query_prefix.startswith("Represent this sentence"))

    def test_fingerprint_changes_for_incompatible_index_settings(self):
        base = EmbeddingConfig("minilm", "model", "revision", "", "flat", 128)
        changed = EmbeddingConfig("minilm", "model", "revision", "", "hnsw", 128)
        changed_schema = EmbeddingConfig(
            "minilm", "model", "revision", "", "flat", 128, schema_version=99
        )

        self.assertNotEqual(base.fingerprint(384), changed.fingerprint(384))
        self.assertNotEqual(base.fingerprint(384), base.fingerprint(768))
        self.assertNotEqual(base.fingerprint(384), changed_schema.fingerprint(384))

    def test_rejects_invalid_batch_size(self):
        with self.assertRaisesRegex(ValueError, "greater than zero"):
            self.load_with(SEMANTIC_SEARCH_EMBEDDING_BATCH_SIZE="0")


if __name__ == "__main__":
    unittest.main()
