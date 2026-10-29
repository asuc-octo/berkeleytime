# MiniLM experiment: Fall 2026

Recorded locally on October 21, 2026 using
`sentence-transformers/all-MiniLM-L6-v2`, the same frozen Fall 2026 catalog and
relevance set as the BGE baseline, and isolated Redis Stack instances with the
production 140 MB limit and `volatile-lru` policy.

MiniLM used unprefixed queries and generated 384-dimensional vectors. The model
was downloaded into a dedicated temporary Hugging Face cache, which occupied
97 MB and was deleted after the experiment.

## Overall comparison

| Measurement | BGE + HNSW | MiniLM + HNSW | MiniLM + FLAT |
| --- | ---: | ---: | ---: |
| Recall@10 | 0.785714 | 0.833333 | 0.833333 |
| MRR@10 | 0.661565 | 0.661565 | 0.661565 |
| nDCG@10 | 0.671603 | 0.680253 | 0.680253 |
| Index build | 393.928 s | 45.240 s | 41.595 s |
| Unique-query median | 66.212 ms | 8.383 ms | 17.331 ms |
| Unique-query p95 | 187.622 ms | 25.714 ms | 32.610 ms |
| Cached-query median | 1.522 ms | 0.976 ms | 1.716 ms |
| Peak process RSS | 2,546.2 MiB | 1,390.4 MiB | 1,404.1 MiB |
| Redis increase, one term | 46.69 MiB | 32.54 MiB | 31.09 MiB |
| Redis vector index | 16.66 MiB | 9.15 MiB | 7.72 MiB |

MiniLM cut index-build time by approximately 8.7–9.5 times, reduced peak
process memory by about 45%, and reduced persistent Redis consumption by
30–33%. Two FLAT term indexes are projected to consume about 62.2 MiB plus
Redis base overhead, compared with roughly 93.4 MiB for two current BGE terms.

## Relevance detail

| Category | Metric | BGE | MiniLM |
| --- | --- | ---: | ---: |
| Course code | Recall@10 | 0.000 | 0.000 |
| Course title | Recall@10 | 1.000 | 1.000 |
| Natural language | Recall@10 | 0.375 | 0.625 |
| Natural language | MRR@10 | 0.077 | 0.375 |
| Topic | Recall@10 | 0.933 | 0.933 |
| Topic | MRR@10 | 0.839 | 0.760 |

MiniLM recovered BIOLOGY 1A for the natural-language biology query and ranked
machine learning, data ethics, and quantum mechanics targets higher. It ranked
some short topic targets lower, including data structures, discrete math,
general chemistry, and organic chemistry. Aggregate MRR remained unchanged.

Neither model handled the `CS 61A` abbreviation. Exact course-code detection
should remain a lexical/hybrid-search responsibility rather than a model
selection criterion.

## HNSW versus FLAT

HNSW and FLAT produced identical labeled Recall@10, MRR@10, and nDCG@10 for
every query. Some non-labeled courses changed order below the first result.
FLAT saved another 1.45 MiB per term and built 3.6 seconds faster. Its direct
search added about 9 ms to a unique query and less than 1 ms to a cached query.

FLAT is therefore the recommended implementation candidate for this corpus and
memory budget. The later concurrent-load test should retain HNSW as a fallback
if exact vector search fails the latency target under realistic traffic.

## Cache observation

The query LRU contained 21 entries after each run, with 21 misses and 42 hits.
At its 256-entry maximum, MiniLM's raw cached vectors occupy only 384 KiB,
before modest Python object overhead. Persistent Redis documents and build-time
model tensors remain the material memory risks.
