#!/usr/bin/env python3
"""Capture and deduplicate the catalog input used by semantic search."""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


APP_ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(APP_ROOT))

from app.generated_operations import SEMANTIC_SEARCH_OPERATION_IDS  # noqa: E402


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--graphql-endpoint",
        default="http://127.0.0.1:3000/api/graphql",
    )
    parser.add_argument("--year", type=int, required=True)
    parser.add_argument("--semester", required=True)
    parser.add_argument("--timeout", type=float, default=60.0)
    parser.add_argument("--output", type=Path, required=True)
    return parser.parse_args()


def fetch_catalog(endpoint: str, year: int, semester: str, timeout: float) -> list[dict[str, Any]]:
    payload = {
        "id": SEMANTIC_SEARCH_OPERATION_IDS["SemanticSearchCatalog"],
        "variables": {"year": year, "semester": semester},
    }
    request = urllib.request.Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "User-Agent": "berkeleytime-semantic-benchmark/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            body = json.load(response)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"{endpoint} returned HTTP {exc.code}: {detail}") from exc

    if body.get("errors"):
        raise RuntimeError(f"catalog query returned errors: {body['errors']}")
    courses = body.get("data", {}).get("catalog")
    if not isinstance(courses, list) or not courses:
        raise RuntimeError("catalog query returned no courses")
    return courses


def deduplicate(courses: list[dict[str, Any]]) -> list[dict[str, Any]]:
    unique: dict[tuple[str, str], dict[str, Any]] = {}
    for course in courses:
        metadata = course.get("course") or {}
        subject = str(metadata.get("subject") or course.get("subject") or "").strip().upper()
        number = str(metadata.get("number") or course.get("courseNumber") or "").strip().upper()
        unique.setdefault((subject, number), course)
    return [unique[key] for key in sorted(unique)]


def main() -> int:
    args = parse_args()
    raw_courses = fetch_catalog(args.graphql_endpoint, args.year, args.semester, args.timeout)
    courses = deduplicate(raw_courses)
    canonical_courses = json.dumps(courses, sort_keys=True, separators=(",", ":")).encode("utf-8")
    snapshot = {
        "schema_version": 1,
        "captured_at": datetime.now(timezone.utc).isoformat(),
        "source": args.graphql_endpoint,
        "year": args.year,
        "semester": args.semester,
        "raw_class_count": len(raw_courses),
        "course_count": len(courses),
        "catalog_sha256": hashlib.sha256(canonical_courses).hexdigest(),
        "courses": courses,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(snapshot, indent=2) + "\n", encoding="utf-8")
    print(
        json.dumps(
            {
                "output": str(args.output),
                "raw_class_count": len(raw_courses),
                "course_count": len(courses),
                "catalog_sha256": snapshot["catalog_sha256"],
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
