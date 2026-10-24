# Semantic Search

<!-- toc -->

## What it is

`apps/semantic-search` is a small Python (FastAPI) service that answers
natural-language catalog queries ("classes about climate policy") by comparing
sentence embeddings. It is the only part of Berkeleytime not written in TypeScript.

```
browser -> backend /api/semantic-search/courses -> semantic-search /search -> Redis vector index
                                                            ^
                     backend /api/graphql (persisted operations) <- index build fetches the catalog
```

- **Model**: `BAAI/bge-base-en-v1.5` from `sentence-transformers`, baked into the Docker image at build time so pods start without downloading.
- **Index**: one [redisvl](https://github.com/redis/redis-vl-python) HNSW index per term in the shared Redis instance, keys prefixed `semantic_search:`.
- **Catalog source**: the service calls the backend's persisted-operation gateway with the two documents in `app/graphql/` (`terms.graphql`, `catalog.graphql`). Their IDs are generated into `app/generated_operations.py` by `npm run generate:operations`; both files must be committed together.
- **Startup**: discovers terms that have catalog data, builds an index per term in a background thread, and retries if the backend is not up yet. `/health` returns 503 until at least one index exists or after a terminal build error, so a broken index fails the Kubernetes rollout instead of silently serving nothing.

## Endpoints (internal, reached through the backend)

| Service endpoint | Backend proxy | Notes |
| --- | --- | --- |
| `GET /health` | `GET /api/semantic-search/health` | index status, build progress, last error |
| `POST /refresh` | `POST /api/semantic-search/refresh` | staff-only and rate-limited in the backend; rebuilds a term index |
| `POST /search` | `GET /api/semantic-search/courses` | returns `{subject, courseNumber}` pairs above a cosine threshold (default 0.3); the catalog page filters the already-loaded list with them |

## Configuration

| Variable | Meaning |
| --- | --- |
| `BACKEND_URL` | where to fetch the catalog (`http://backend:5001` locally, the backend Service in Kubernetes) |
| `REDIS_URI` | shared Redis |
| `SEMANTIC_SEARCH_YEAR`, `SEMANTIC_SEARCH_SEMESTER` | optional default term used when a request omits one; set in `docker-compose.yml` and `infra/app/values.yaml` (`semanticSearch.defaultYear/defaultSemester`). The backend always passes the term, so this is a fallback, but keep it current |
| `SEMANTIC_SEARCH_ALLOWED_SUBJECTS` | optional comma-separated subject allowlist |
| `SEMANTIC_SEARCH_LOG_LEVEL` | default `INFO` |

## Local development

```sh
docker compose --profile semantic-search up -d     # service on http://localhost:3010
curl -s localhost:3010/health | jq
```

The first index build downloads nothing (model is in the image) but embeds every
course in the term, which takes a few minutes on a laptop. Dependencies are
pinned in `requirements.lock` (installed with `uv`); edit `requirements.txt` and
regenerate the lock when adding a package.

There are no automated tests for this service yet; the Playwright API project
(`tests/api/semantic-search-terms.spec.ts`) covers the backend proxy.
