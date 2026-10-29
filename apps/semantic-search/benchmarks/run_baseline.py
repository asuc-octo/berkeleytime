#!/usr/bin/env python3
"""Run a repeatable relevance and HTTP-latency baseline against semantic search."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import statistics
import subprocess
import time
import urllib.error
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


DEFAULT_QUERY_SET = Path(__file__).with_name("queries.v1.json")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--endpoint",
        default="http://127.0.0.1:3010/search",
        help="Semantic-search POST endpoint.",
    )
    parser.add_argument("--year", type=int, default=2026)
    parser.add_argument("--semester", default="Fall")
    parser.add_argument("--threshold", type=float, default=0.3)
    parser.add_argument("--top-k", type=int, default=10)
    parser.add_argument("--repetitions", type=int, default=3)
    parser.add_argument("--timeout", type=float, default=30.0)
    parser.add_argument("--query-set", type=Path, default=DEFAULT_QUERY_SET)
    parser.add_argument("--catalog-snapshot", type=Path)
    parser.add_argument("--model", default="BAAI/bge-base-en-v1.5")
    parser.add_argument("--output", type=Path)
    return parser.parse_args()


def percentile(values: list[float], percentile_value: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    rank = max(1, math.ceil(percentile_value * len(ordered)))
    return ordered[rank - 1]


def normalize_course_id(subject: Any, course_number: Any) -> str:
    return f"{str(subject or '').strip()} {str(course_number or '').strip()}".upper()


def request_json(url: str, payload: dict[str, Any], timeout: float) -> dict[str, Any]:
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "User-Agent": "berkeleytime-semantic-benchmark/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return json.load(response)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"{url} returned HTTP {exc.code}: {detail}") from exc


def load_query_set(path: Path) -> tuple[dict[str, Any], str]:
    raw = path.read_bytes()
    fixture = json.loads(raw)
    queries = fixture.get("queries")
    if not isinstance(queries, list) or not queries:
        raise ValueError("query set must contain a non-empty queries list")

    ids: set[str] = set()
    for query in queries:
        query_id = query.get("id")
        relevant = query.get("relevant_courses")
        if not query_id or query_id in ids:
            raise ValueError(f"query id must be present and unique: {query_id!r}")
        if not query.get("query") or not isinstance(relevant, list) or not relevant:
            raise ValueError(f"query {query_id!r} needs text and relevant_courses")
        ids.add(query_id)

    return fixture, hashlib.sha256(raw).hexdigest()


def load_catalog_snapshot(path: Path) -> tuple[dict[str, Any], set[str]]:
    snapshot = json.loads(path.read_bytes())
    courses = snapshot.get("courses")
    if not isinstance(courses, list) or not courses:
        raise ValueError("catalog snapshot must contain a non-empty courses list")
    course_ids = {
        normalize_course_id(course.get("subject"), course.get("courseNumber"))
        for course in courses
    }
    return snapshot, course_ids


def relevance_metrics(ranked: list[str], relevant: set[str], top_k: int) -> dict[str, float]:
    top = ranked[:top_k]
    matched: set[str] = set()
    relevant_ranks = []
    for index, course in enumerate(top):
        if course in relevant and course not in matched:
            matched.add(course)
            relevant_ranks.append(index + 1)
    recall = len(matched) / len(relevant)
    reciprocal_rank = 1.0 / relevant_ranks[0] if relevant_ranks else 0.0
    dcg = sum(1.0 / math.log2(rank + 1) for rank in relevant_ranks)
    ideal_hits = min(len(relevant), top_k)
    ideal_dcg = sum(1.0 / math.log2(rank + 1) for rank in range(1, ideal_hits + 1))
    return {
        f"recall_at_{top_k}": recall,
        f"mrr_at_{top_k}": reciprocal_rank,
        f"ndcg_at_{top_k}": dcg / ideal_dcg if ideal_dcg else 0.0,
    }


def git_revision() -> str | None:
    try:
        return subprocess.run(
            ["git", "rev-parse", "HEAD"],
            check=True,
            capture_output=True,
            text=True,
        ).stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        return None


def main() -> int:
    args = parse_args()
    if args.top_k < 1 or args.repetitions < 1:
        raise ValueError("top-k and repetitions must be positive")

    fixture, fixture_hash = load_query_set(args.query_set)
    snapshot_metadata: dict[str, Any] | None = None
    if args.catalog_snapshot:
        snapshot, available_course_ids = load_catalog_snapshot(args.catalog_snapshot)
        missing_labels = {
            query["id"]: sorted(
                set(map(str.upper, query["relevant_courses"])) - available_course_ids
            )
            for query in fixture["queries"]
        }
        missing_labels = {
            query_id: missing
            for query_id, missing in missing_labels.items()
            if missing
        }
        if missing_labels:
            raise ValueError(f"relevance labels missing from catalog: {missing_labels}")
        snapshot_metadata = {
            "year": snapshot.get("year"),
            "semester": snapshot.get("semester"),
            "course_count": len(snapshot["courses"]),
            "catalog_sha256": snapshot.get("catalog_sha256"),
        }
    query_results: list[dict[str, Any]] = []
    all_latencies: list[float] = []
    first_request_latencies: list[float] = []
    repeat_request_latencies: list[float] = []
    metrics_by_category: dict[str, list[dict[str, float]]] = defaultdict(list)

    for query_case in fixture["queries"]:
        latencies: list[float] = []
        response: dict[str, Any] | None = None
        for repetition in range(args.repetitions):
            started = time.perf_counter()
            response = request_json(
                args.endpoint,
                {
                    "query": query_case["query"],
                    "threshold": args.threshold,
                    "year": args.year,
                    "semester": args.semester,
                },
                args.timeout,
            )
            elapsed_ms = (time.perf_counter() - started) * 1_000
            latencies.append(elapsed_ms)
            all_latencies.append(elapsed_ms)
            if repetition == 0:
                first_request_latencies.append(elapsed_ms)
            else:
                repeat_request_latencies.append(elapsed_ms)

        assert response is not None
        ranked = [
            normalize_course_id(result.get("subject"), result.get("courseNumber"))
            for result in response.get("results", [])
        ]
        relevant = {str(course).upper() for course in query_case["relevant_courses"]}
        metrics = relevance_metrics(ranked, relevant, args.top_k)
        metrics_by_category[query_case["category"]].append(metrics)
        query_results.append(
            {
                **query_case,
                "ranked_courses": ranked[: args.top_k],
                "metrics": metrics,
                "latency_ms": {
                    "samples": [round(value, 3) for value in latencies],
                    "median": round(statistics.median(latencies), 3),
                },
            }
        )

    metric_names = [f"recall_at_{args.top_k}", f"mrr_at_{args.top_k}", f"ndcg_at_{args.top_k}"]

    def average_metrics(rows: list[dict[str, float]]) -> dict[str, float]:
        return {
            name: round(statistics.fmean(row[name] for row in rows), 6)
            for name in metric_names
        }

    all_metrics = [result["metrics"] for result in query_results]

    def latency_summary(values: list[float]) -> dict[str, float | int] | None:
        if not values:
            return None
        return {
            "sample_count": len(values),
            "median": round(statistics.median(values), 3),
            "p95": round(percentile(values, 0.95), 3),
            "mean": round(statistics.fmean(values), 3),
        }

    report = {
        "schema_version": 1,
        "recorded_at": datetime.now(timezone.utc).isoformat(),
        "git_revision": git_revision(),
        "model": args.model,
        "target": {
            "endpoint": args.endpoint,
            "year": args.year,
            "semester": args.semester,
            "threshold": args.threshold,
            "top_k": args.top_k,
            "repetitions": args.repetitions,
        },
        "query_set": {
            "name": fixture.get("name"),
            "schema_version": fixture.get("schema_version"),
            "sha256": fixture_hash,
            "query_count": len(query_results),
            "catalog_snapshot": snapshot_metadata,
        },
        "summary": {
            **average_metrics(all_metrics),
            "latency_ms": {
                "all_requests": latency_summary(all_latencies),
                "first_request_per_query": latency_summary(first_request_latencies),
                "repeat_requests": latency_summary(repeat_request_latencies),
            },
            "by_category": {
                category: average_metrics(rows)
                for category, rows in sorted(metrics_by_category.items())
            },
        },
        "queries": query_results,
    }

    rendered = json.dumps(report, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
