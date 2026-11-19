import hashlib
import json
import os
import re
from dataclasses import dataclass
from typing import Optional


MINILM_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
MINILM_MODEL_REVISION = "1110a243fdf4706b3f48f1d95db1a4f5529b4d41"
INDEX_SCHEMA_VERSION = 3


def _read_positive_int(name: str, default: int) -> int:
    raw = os.getenv(name, str(default))
    try:
        value = int(raw)
    except ValueError as exc:
        raise ValueError(f"{name} must be an integer") from exc
    if value <= 0:
        raise ValueError(f"{name} must be greater than zero")
    return value


def _read_bool(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _slug(value: str) -> str:
    slug = re.sub(r"[^a-z0-9_-]+", "-", value.strip().lower()).strip("-")
    return slug or "embedding"


@dataclass(frozen=True)
class EmbeddingConfig:
    profile: str
    model_name: str
    model_revision: Optional[str]
    query_prefix: str
    vector_algorithm: str
    batch_size: int
    schema_version: int = INDEX_SCHEMA_VERSION

    def fingerprint(self, dimensions: int) -> str:
        payload = json.dumps(
            {
                "model_name": self.model_name,
                "model_revision": self.model_revision,
                "dimensions": dimensions,
                "vector_algorithm": self.vector_algorithm,
                "schema_version": self.schema_version,
            },
            sort_keys=True,
            separators=(",", ":"),
        )
        digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()[:12]
        return f"{_slug(self.profile)}-{digest}"


def load_embedding_config() -> EmbeddingConfig:
    model_name = os.getenv("SEMANTIC_SEARCH_MODEL", MINILM_MODEL_NAME).strip()
    revision_env = os.getenv("SEMANTIC_SEARCH_MODEL_REVISION")
    model_revision = revision_env.strip() if revision_env and revision_env.strip() else None
    if model_revision is None and model_name == MINILM_MODEL_NAME:
        model_revision = MINILM_MODEL_REVISION

    default_prefix = (
        "Represent this sentence for searching relevant passages: "
        if model_name.startswith("BAAI/bge-")
        else ""
    )
    query_prefix = os.getenv("SEMANTIC_SEARCH_QUERY_PREFIX", default_prefix)
    vector_algorithm = os.getenv("SEMANTIC_SEARCH_VECTOR_ALGORITHM", "flat").strip().lower()
    if vector_algorithm not in {"flat", "hnsw"}:
        raise ValueError("SEMANTIC_SEARCH_VECTOR_ALGORITHM must be 'flat' or 'hnsw'")

    return EmbeddingConfig(
        profile=os.getenv("SEMANTIC_SEARCH_EMBEDDING_PROFILE", "minilm-l6-v2"),
        model_name=model_name,
        model_revision=model_revision,
        query_prefix=query_prefix,
        vector_algorithm=vector_algorithm,
        batch_size=_read_positive_int("SEMANTIC_SEARCH_EMBEDDING_BATCH_SIZE", 128),
    )


EMBEDDING_CONFIG = load_embedding_config()
PURGE_LEGACY_INDEXES = _read_bool("SEMANTIC_SEARCH_PURGE_LEGACY_INDEXES")
