# Semantic-search model baseline

This directory contains the versioned relevance set and runner used to compare
embedding models on the same catalog term. It deliberately tests the existing
HTTP contract so that the BGE baseline and MiniLM candidate follow the same
backend path.

The initial query labels are restricted to courses verified in the Fall 2026
catalog. Treat them as a starter set: product review and real anonymized search
patterns should expand it before a model rollout decision.

## Run locally

Capture the fixed catalog input first:

```sh
python3 apps/semantic-search/benchmarks/capture_catalog.py \
  --graphql-endpoint http://127.0.0.1:3000/api/graphql \
  --year 2026 \
  --semester Fall \
  --output /tmp/fall-2026-catalog.json
```

Start the semantic-search profile, wait for `/health` to report `ok`, then run:

```sh
python3 apps/semantic-search/benchmarks/run_baseline.py \
  --endpoint http://127.0.0.1:3010/search \
  --year 2026 \
  --semester Fall \
  --catalog-snapshot /tmp/fall-2026-catalog.json \
  --output /tmp/bge-baseline.json
```

The output records the query-set hash, Git revision, per-query rankings,
Recall@10, MRR@10, nDCG@10, and HTTP latency samples. First requests and repeat
requests are summarized separately because the current service caches up to 256
query embeddings. Keep the raw report with the catalog snapshot used for the
run.

For the resource portion of the baseline, record these at idle, during a full
index rebuild, and after the final query repetition:

- semantic-search container RSS and peak memory;
- Redis `used_memory` and `used_memory_peak`;
- per-index memory from `FT.INFO`;
- index build start and completion timestamps;
- catalog count and deduplicated course count.

Network latency is included when the runner targets a remote endpoint. Use a
local endpoint for model-runtime comparisons.

`run_engine_baseline.py` is the production-like resource runner. Run it inside
the semantic-search image against an isolated Redis Stack instance capped at
the production memory limit. It loads the frozen catalog directly, measures
model load and index build time, records process RSS and Redis memory, and then
runs the same relevance set without HTTP or internet latency.

Candidate experiments can override `SEMANTIC_SEARCH_MODEL` and
`SEMANTIC_SEARCH_VECTOR_ALGORITHM`. The production defaults are pinned MiniLM
and FLAT. BGE models receive their retrieval instruction automatically when
used for comparison; MiniLM uses unprefixed queries.
