# MiniLM implementation acceptance: Fall 2026

Recorded locally on October 28, 2026 after the MiniLM implementation and
vector-store boundary were added. The run used the pinned
`sentence-transformers/all-MiniLM-L6-v2` revision
`1110a243fdf4706b3f48f1d95db1a4f5529b4d41`, 384-dimensional embeddings,
FLAT cosine search, and Redis Stack capped at the production 140 MB limit.

The read-only catalog capture contained 4,549 courses and had SHA-256
`542c8aced21692b7a68aa39b911eb0cdf2852579f38ac80e078ad906b3491a56`.

## Acceptance results

| Measurement | Result |
| --- | ---: |
| Recall@10 | 0.833333 |
| MRR@10 | 0.661565 |
| nDCG@10 | 0.680253 |
| Index build | 85.210 s |
| First-query median | 10.727 ms |
| First-query p95 | 25.573 ms |
| Cached-query median | 1.339 ms |
| Cached-query p95 | 1.556 ms |
| Peak process RSS | 1,400,434,688 bytes |
| Redis before build | 1,392,952 bytes |
| Redis after one term | 20,454,976 bytes |
| Redis increase, one term | 19,062,024 bytes |
| Redis vector index | 7.721 MiB |

The relevance results exactly match the earlier MiniLM experiment. Removing
the duplicated title, description, and assembled course text from Redis cut
the one-term Redis increase from approximately 31.09 MiB to 18.18 MiB. A
separate integration test built two 4,548-course indexes under the same 140 MB
limit and passed.

The engine also passed fresh-build, compatible-restart, interrupted-build
recovery, model/index compatibility, scoped legacy-index migration, storage
boundary, and unchanged search-contract tests.
