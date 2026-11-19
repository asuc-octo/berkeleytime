import json
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Protocol

import numpy as np
import redis
from redisvl.index import SearchIndex
from redisvl.query import VectorQuery
from redisvl.redis.utils import array_to_buffer


@dataclass(frozen=True)
class VectorRecord:
    subject: str
    course_number: str
    embedding: np.ndarray


@dataclass(frozen=True)
class VectorMatch:
    distance: float
    subject: Optional[str]
    course_number: Optional[str]


class VectorIndex(Protocol):
    name: str

    # Implementations normalize backend scores to cosine distance.
    def search(self, vector: np.ndarray, limit: int) -> List[VectorMatch]: ...


class VectorStore(Protocol):
    backend_name: str

    def create_index(self, name: str, dimensions: int, algorithm: str) -> VectorIndex: ...

    def open_index(self, name: str, dimensions: int, algorithm: str) -> Optional[VectorIndex]: ...

    def load_batch(self, index: VectorIndex, records: Iterable[VectorRecord]) -> None: ...

    def delete_index(self, name: str) -> None: ...

    def get_metadata(self, key: str) -> Optional[Dict]: ...

    def set_metadata(self, key: str, value: Dict) -> None: ...

    def delete_metadata(self, key: str) -> None: ...

    def scan_metadata(self, pattern: str) -> List[Dict]: ...

    def purge_legacy_indexes(self) -> int: ...

    def purge_stale_indexes(self, active_prefix: str) -> int: ...


class RedisVectorIndex:
    def __init__(self, name: str, search_index: SearchIndex) -> None:
        self.name = name
        self._search_index = search_index

    def search(self, vector: np.ndarray, limit: int) -> List[VectorMatch]:
        query = VectorQuery(
            vector=vector.tolist(),
            vector_field_name="embedding",
            return_fields=["subject", "course_number"],
            num_results=limit,
        )
        return [
            VectorMatch(
                distance=float(result.get("vector_distance", 1.0)),
                subject=result.get("subject") or None,
                course_number=result.get("course_number") or None,
            )
            for result in self._search_index.query(query)
        ]


class RedisVectorStore:
    backend_name = "redis"

    def __init__(self, redis_url: str) -> None:
        self.redis_url = redis_url
        self._redis = redis.from_url(redis_url, decode_responses=True)

    @staticmethod
    def _schema(name: str, dimensions: int, algorithm: str) -> Dict:
        return {
            "index": {"name": name, "prefix": f"{name}:doc"},
            "fields": [
                {"name": "subject", "type": "tag"},
                {"name": "course_number", "type": "tag"},
                {
                    "name": "embedding",
                    "type": "vector",
                    "attrs": {
                        "dims": dimensions,
                        "algorithm": algorithm,
                        "datatype": "float32",
                        "distance_metric": "cosine",
                    },
                },
            ],
        }

    def _search_index(self, name: str, dimensions: int, algorithm: str) -> SearchIndex:
        return SearchIndex.from_dict(
            self._schema(name, dimensions, algorithm),
            redis_url=self.redis_url,
        )

    def create_index(self, name: str, dimensions: int, algorithm: str) -> RedisVectorIndex:
        search_index = self._search_index(name, dimensions, algorithm)
        search_index.create(overwrite=True)
        return RedisVectorIndex(name, search_index)

    def open_index(
        self, name: str, dimensions: int, algorithm: str
    ) -> Optional[RedisVectorIndex]:
        search_index = self._search_index(name, dimensions, algorithm)
        if not search_index.exists():
            return None
        return RedisVectorIndex(name, search_index)

    def load_batch(self, index: VectorIndex, records: Iterable[VectorRecord]) -> None:
        if not isinstance(index, RedisVectorIndex):
            raise TypeError("RedisVectorStore received an index from another backend")
        data = [
            {
                "subject": record.subject,
                "course_number": record.course_number,
                "embedding": array_to_buffer(record.embedding, dtype="float32"),
            }
            for record in records
        ]
        if data:
            index._search_index.load(data)

    def delete_index(self, name: str) -> None:
        try:
            self._redis.execute_command("FT.DROPINDEX", name, "DD")
        except redis.ResponseError as exc:
            if "unknown index name" not in str(exc).lower():
                raise

    def get_metadata(self, key: str) -> Optional[Dict]:
        raw = self._redis.get(key)
        return json.loads(raw) if raw else None

    def set_metadata(self, key: str, value: Dict) -> None:
        self._redis.set(key, json.dumps(value))

    def delete_metadata(self, key: str) -> None:
        self._redis.delete(key)

    def scan_metadata(self, pattern: str) -> List[Dict]:
        metadata: List[Dict] = []
        for key in self._redis.scan_iter(match=pattern, count=100):
            try:
                value = self.get_metadata(key)
            except (json.JSONDecodeError, TypeError):
                continue
            if isinstance(value, dict):
                value["_meta_key"] = key
                metadata.append(value)
        return metadata

    def purge_legacy_indexes(self) -> int:
        """Remove only pre-v2 semantic-search indexes recorded by legacy metadata."""
        removed = 0
        pattern = "semantic_search:meta:semantic_search:*"
        for key in self._redis.scan_iter(match=pattern, count=100):
            index_name = key.removeprefix("semantic_search:meta:")
            if not index_name.startswith("semantic_search:") or index_name.startswith(
                "semantic_search:v2:"
            ):
                continue
            self.delete_index(index_name)
            self._redis.delete(key)
            removed += 1
        return removed

    def purge_stale_indexes(self, active_prefix: str) -> int:
        """Remove fingerprinted semantic indexes from previous generations."""
        removed = 0
        active_metadata_prefix = f"{active_prefix}:meta:"
        for key in self._redis.scan_iter(match="semantic_search:v*:meta:*", count=100):
            if key.startswith(active_metadata_prefix):
                continue
            try:
                metadata = self.get_metadata(key)
            except (json.JSONDecodeError, TypeError):
                continue
            index_name = metadata.get("index_name") if isinstance(metadata, dict) else None
            if not isinstance(index_name, str) or not index_name.startswith("semantic_search:v"):
                continue
            self.delete_index(index_name)
            self._redis.delete(key)
            removed += 1
        return removed
