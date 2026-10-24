# Testing

<!-- toc -->

## What exists and where it runs

| Layer | Tool | Location | Runs in CI? |
| --- | --- | --- | --- |
| Backend unit | `node:test` through `tsx` | `apps/backend/src/**/*.test.ts` (today: auth directive, persisted-operation gateway) | yes, `CI: Check Lint` |
| Frontend unit | Vitest | `apps/frontend/src/**/*.test.ts` (chart utils, schedule palette) | yes, `CI: Check Lint` |
| BtLL | custom runner | `packages/BtLL/src/test.ts` | yes, `CI: Check Lint` |
| API + sanity | Playwright (`sanity`, `api` projects) | `tests/sanity`, `tests/api` | yes, `CI: GraphQL Boundary Tests` against a fresh `docker compose` stack |
| End to end | Playwright (`e2e-*` projects, four browsers) | `tests/e2e` | no, manual |
| Semantic search (Python) | none yet | | |

Run everything the PR gate runs with `npm run check`; just the unit tests with
`npm run test`. Playwright: `npm run test:e2e -- --project=sanity --project=api`
(`REUSE_EXISTING_TEST_SERVER=true` reuses a running compose stack). Details for
Playwright are in `tests/README.md`.

## Calling the GraphQL API from a test

The public endpoint only accepts persisted-operation IDs, so tests look the
operation up from the generated allowlist instead of sending GraphQL text:

```ts
import { persistedOperationBySource } from "../helpers/persisted-operation";

const body = persistedOperationBySource(
  "apps/frontend/src/lib/api/courses.ts",
  "GetCourse",
  { subject: "COMPSCI", number: "61A" }
);
const response = await request.post("/api/graphql", { data: body });
```

## What to test, and where

- A bug fix gets a unit test next to the code that reproduces the bug.
- Pure logic (formatters, parsers, utilities, BtLL programs) gets unit tests. They are cheap and run in seconds.
- Authorization changes get an API test: unauthenticated caller rejected, owner allowed, a different signed-in user cannot read or modify the record.
- New pages get at least a sanity test that the route renders.
- Do not add Playwright e2e tests for things a unit test can cover; the e2e suite is slow and not part of the gate.

## Gaps worth closing

Roughly 100k lines of TypeScript are covered by eleven test files. The highest-value
additions, in order: datapuller parsers (`apps/datapuller/src/lib/*.ts`, pure
functions over SIS payloads), backend controllers with authorization logic
(schedule, plan, collection, rating), and the catalog denormalization.
