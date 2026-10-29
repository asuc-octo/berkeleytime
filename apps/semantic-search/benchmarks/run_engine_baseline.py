#!/usr/bin/env python3
"""Benchmark the search engine directly against a frozen catalog snapshot."""

from __future__ import annotations

import argparse
import json
import os
import statistics
import sys
import time
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


BENCHMARK_DIR = Path(__file__).parent
sys.path.insert(0, str(BENCHMARK_DIR))

from run_baseline import (  # noqa: E402
    load_catalog_snapshot,
    load_query_set,
    normalize_course_id,
    percentile,
    relevance_metrics,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--app-root", type=Path, default=Path(__file__).parents[1])
    parser.add_argument("--catalog-snapshot", type=Path, required=True)
    parser.add_argument(
        "--query-set",
        type=Path,
        default=BENCHMARK_DIR / "queries.v1.json",
    )
    parser.add_argument("--redis-url", default="redis://127.0.0.1:6379")
    parser.add_argument("--year", type=int, default=2026)
    parser.add_argument("--semester", default="Fall")
    parser.add_argument("--threshold", type=float, default=0.3)
    parser.add_argument("--top-k", type=int, default=10)
    parser.add_argument("--repetitions", type=int, default=3)
    parser.add_argument("--output", type=Path, required=True)
    return parser.parse_args()


def process_memory() -> dict[str, int | None]:
    values: dict[str, int | None] = {"rss_bytes": None, "peak_rss_bytes": None}
    try:
        status = Path("/proc/self/status").read_text(encoding="utf-8")
    except OSError:
        return values
    for line in status.splitlines():
        if line.startswith("VmRSS:"):
            values["rss_bytes"] = int(line.split()[1]) * 1024
        elif line.startswith("VmHWM:"):
            values["peak_rss_bytes"] = int(line.split()[1]) * 1024
    return values


def redis_memory(redis_client: Any) -> dict[str, int]:
    info = redis_client.info("memory")
    fields = (
        "used_memory",
        "used_memory_peak",
        "used_memory_dataset",
        "maxmemory",
    )
    return {field: int(info.get(field, 0)) for field in fields}


def pairs_to_dict(value: Any) -> Any:
    if not isinstance(value, list):
        return value
    if len(value) % 2 == 0 and all(isinstance(value[index], str) for index in range(0, len(value), 2)):
        return {
            value[index]: pairs_to_dict(value[index + 1])
            for index in range(0, len(value), 2)
        }
    return [pairs_to_dict(item) for item in value]


def latency_summary(values: list[float]) -> dict[str, float | int] | None:
    if not values:
        return None
    return {
        "sample_count": len(values),
        "median": round(statistics.median(values), 3),
        "p95": round(percentile(values, 0.95), 3),
        "mean": round(statistics.fmean(values), 3),
    }


def main() -> int:
    args = parse_args()
    os.environ["REDIS_URI"] = args.redis_url
    os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")
    sys.path.insert(0, str(args.app_root))

    from app.engine import SemanticSearchEngine

    snapshot, available_course_ids = load_catalog_snapshot(args.catalog_snapshot)
    fixture, fixture_hash = load_query_set(args.query_set)
    missing_labels = {
        query["id"]: sorted(
            set(map(str.upper, query["relevant_courses"])) - available_course_ids
        )
        for query in fixture["queries"]
    }
    missing_labels = {key: value for key, value in missing_labels.items() if value}
    if missing_labels:
        raise ValueError(f"relevance labels missing from catalog: {missing_labels}")

    model_started = time.perf_counter()
    engine = SemanticSearchEngine()
    redis_client = engine._store._redis
    model_load_seconds = time.perf_counter() - model_started
    memory_after_model_load = process_memory()
    redis_before = redis_memory(redis_client)

    courses = snapshot["courses"]
    engine._fetch_courses = lambda _year, _semester: courses
    build_started = time.perf_counter()
    entry = engine.refresh(args.year, args.semester)
    build_seconds = time.perf_counter() - build_started
    memory_after_build = process_memory()
    redis_after_build = redis_memory(redis_client)

    index_name = engine._get_index_name(args.year, args.semester, None)
    try:
        index_info = pairs_to_dict(redis_client.execute_command("FT.INFO", index_name))
    except Exception as exc:
        index_info = {"error": str(exc)}

    first_latencies: list[float] = []
    repeat_latencies: list[float] = []
    query_results: list[dict[str, Any]] = []
    for query_case in fixture["queries"]:
        samples: list[float] = []
        ranked: list[str] = []
        for repetition in range(args.repetitions):
            started = time.perf_counter()
            results, _ = engine.search(
                query_case["query"],
                args.year,
                args.semester,
                threshold=args.threshold,
            )
            elapsed_ms = (time.perf_counter() - started) * 1_000
            samples.append(elapsed_ms)
            if repetition == 0:
                first_latencies.append(elapsed_ms)
            else:
                repeat_latencies.append(elapsed_ms)
            ranked = [
                normalize_course_id(result.get("subject"), result.get("courseNumber"))
                for result in results
            ]
        relevant = set(map(str.upper, query_case["relevant_courses"]))
        query_results.append(
            {
                **query_case,
                "ranked_courses": ranked[: args.top_k],
                "metrics": relevance_metrics(ranked, relevant, args.top_k),
                "latency_ms": {
                    "samples": [round(value, 3) for value in samples],
                    "median": round(statistics.median(samples), 3),
                },
            }
        )

    metric_names = [f"recall_at_{args.top_k}", f"mrr_at_{args.top_k}", f"ndcg_at_{args.top_k}"]
    metrics_by_category: dict[str, list[dict[str, float]]] = defaultdict(list)
    for result in query_results:
        metrics_by_category[result["category"]].append(result["metrics"])

    def average_metrics(rows: list[dict[str, float]]) -> dict[str, float]:
        return {
            name: round(statistics.fmean(row[name] for row in rows), 6)
            for name in metric_names
        }

    report = {
        "schema_version": 1,
        "recorded_at": datetime.now(timezone.utc).isoformat(),
        "model": engine.embedding_config.model_name,
        "model_revision": engine.embedding_config.model_revision,
        "embedding_dimensions": engine._embedding_dims,
        "vector_algorithm": engine.embedding_config.vector_algorithm,
        "target": {
            "year": args.year,
            "semester": args.semester,
            "threshold": args.threshold,
            "top_k": args.top_k,
            "repetitions": args.repetitions,
        },
        "catalog_snapshot": {
            "catalog_sha256": snapshot.get("catalog_sha256"),
            "raw_class_count": snapshot.get("raw_class_count"),
            "course_count": snapshot.get("course_count"),
            "indexed_course_count": entry.size,
        },
        "query_set": {
            "name": fixture.get("name"),
            "sha256": fixture_hash,
            "query_count": len(query_results),
        },
        "summary": {
            **average_metrics([result["metrics"] for result in query_results]),
            "by_category": {
                category: average_metrics(rows)
                for category, rows in sorted(metrics_by_category.items())
            },
            "latency_ms": {
                "first_request_per_query": latency_summary(first_latencies),
                "repeat_requests": latency_summary(repeat_latencies),
            },
            "model_load_seconds": round(model_load_seconds, 3),
            "index_build_seconds": round(build_seconds, 3),
        },
        "memory": {
            "process_after_model_load": memory_after_model_load,
            "process_after_build": memory_after_build,
            "process_after_queries": process_memory(),
            "redis_before": redis_before,
            "redis_after_build": redis_after_build,
            "redis_after_queries": redis_memory(redis_client),
            "redis_index": index_info,
        },
        "query_cache": (
            engine._encode_query.cache_info()._asdict()
            if hasattr(engine._encode_query, "cache_info")
            else None
        ),
        "queries": query_results,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(args.output), "summary": report["summary"], "memory": report["memory"]}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
