# Berkeleytime: working in this repository

This file is the shared context for every contributor, human or AI agent. Cursor,
Claude Code, Codex and similar tools read it automatically. If something here is
wrong, fix it in the same PR that changes the behavior.

Berkeleytime (berkeleytime.com) is UC Berkeley's student-run course discovery and
planning site: catalog search, grade distributions, enrollment history, ratings,
schedule planning, and degree planning (GradTrak). It is built and operated by
students in the ASUC Office of the CTO who rotate out every few years, so
**readability and explicit documentation beat cleverness**.

## Repository map

Monorepo managed by npm workspaces + Turborepo. Node 22 (see `.nvmrc`), TypeScript
everywhere except the Python semantic-search service.

| Path | What it is | Runs where |
| --- | --- | --- |
| `apps/backend` | Express + Apollo GraphQL API, Mongoose models, background jobs. Public GraphQL is a **persisted-operation gateway** at `/api/graphql`. | `bt-*-app-backend` pods |
| `apps/frontend` | React 19 + Vite single-page app at berkeleytime.com | `bt-*-app-frontend` pods |
| `apps/datapuller` | CLI of "pullers" that load SIS data (terms, courses, classes, sections, grades, enrollments, DeCals) into MongoDB. One Kubernetes CronJob per puller. | CronJobs, see `infra/app/values.yaml` |
| `apps/semantic-search` | Python FastAPI service: sentence-transformer embeddings + Redis vector index for natural-language course search | `bt-*-app-semantic-search` pod |
| `apps/staff-frontend` | Internal staff dashboard (staff roster, analytics, banners, redirects, outreach) at staff.berkeleytime.com | `bt-staff-frontend` |
| `apps/ag-frontend` | Internal editor for "curated classes" shown on the main site, at ag.berkeleytime.com | `bt-ag-frontend` |
| `apps/docs` | mdBook developer docs at docs.berkeleytime.com (source of truth for long-form docs) | `bt-prod-docs` |
| `apps/storybook` | Storybook for `packages/theme` at storybook.berkeleytime.com | `bt-prod-storybook` |
| `apps/api-sandbox` | Local-only UI for poking the campus SIS APIs (needs API keys, never deployed) | local |
| `packages/common` | Mongoose models (`@repo/common/models`) and browser-safe utilities shared by backend, datapuller, frontends | library |
| `packages/gql-typedefs` | The GraphQL schema (SDL in `gql` tags), one file per domain. Single source of truth for the API. | library |
| `packages/shared` | Rating metric config, staff helpers, `persistedOperationFetch` (the client half of the GraphQL gateway) | library |
| `packages/theme` | Design system: Radix-based components, color/typography tokens, `ThemeProvider` | library |
| `packages/BtLL` | "Berkeleytime Logical Language": a small interpreted DSL that evaluates GradTrak degree requirements. `reference_gradtrak_reqs.ts` holds the requirement programs seeded into Mongo. | library |
| `packages/sis-api` | TypeScript clients generated from campus OpenAPI specs in `specs/`. `dist/` is generated, not committed. | library |
| `packages/eslint-config`, `packages/typescript-config` | Shared lint and TS presets | tooling |
| `infra/` | Helm charts: `app` (frontend+backend+semantic-search+datapuller), `base` (cluster-wide: certs, backups, roles), `mongo`, `redis`, `staff`, `ag`, `docs`, `storybook`, `observability`; Cloudflare worker for backups | hozer-51 (single-node k8s at the OCF) |
| `migrations/` | mongosh migration scripts. Source of truth; `infra/mongo/migrations/` is a copy packaged into a ConfigMap (CI checks they match). | manual |
| `tests/` | Playwright: `sanity` and `api` projects run in CI against docker compose; `e2e` is manual | CI + local |
| `docs/` | Repo-level docs that are not part of the docs site: security boundary, audits | - |
| `scripts/` | `bootstrap-local.sh` (one-shot local setup), env/compose checks, catalog rebuild | local |

Deployment and architecture details: `apps/docs/src/core/infrastructure/`.

## Commands you will actually use

```sh
bash scripts/bootstrap-local.sh      # first-time setup: .env, deps, codegen, docker compose up, seed DB
docker compose up -d                 # core stack on http://localhost:3000 (nginx -> frontend + backend)
docker compose --profile staff up -d # add profiles: staff, ag, semantic-search, docs, dev (MinIO)

npm run generate                     # GraphQL types (backend + frontend) and the SIS API client. Run after schema changes.
npm run generate:operations          # after adding/changing any gql`` operation; commit the generated allowlist
npm run check                        # the full PR gate: operations, migrations, format, type-check, lint, unit tests
npm run format                       # prettier --write
npm run test:e2e -- --project=sanity --project=api   # Playwright against docker compose
```

Ports with the default `DEV_PORT_PREFIX=30`: 3000 app, 3001 AG, 3002 staff, 3003 docs,
3004 Redis, 3005 Storybook, 3006/3007 MinIO, 3008 MongoDB, 3009 API sandbox,
3010 semantic search. Everything binds to 127.0.0.1 only.

## How a request flows

```
browser --POST {id, variables}--> nginx/ingress --> backend persisted-operation gateway
   --> Apollo (in-process) --> resolver --> controller (Mongoose) --> formatter --> JSON
```

- The frontend never sends GraphQL text. `persistedOperationFetch` hashes the
  `gql` document; the backend looks the hash up in
  `apps/backend/src/bootstrap/graphql/generated/persistedOperations.ts`.
  Unknown hash = 404. That file is generated by `npm run generate:operations`
  and **must be committed with the operation change**. Read
  `docs/security/public-graphql-boundary.md` before touching this.
- Data enters MongoDB only through the datapuller (SIS APIs, AWS Athena for
  grades, DeCal board) and user actions. The backend caches hot reads in Redis.
- `catalog_classes` is a denormalized collection built by the datapuller
  (`apps/datapuller/src/lib/catalog-denormalize.ts`) so catalog search is one
  query. Rebuild locally with `npx tsx scripts/rebuild-catalog.ts`.

## Backend module pattern (`apps/backend/src/modules/<domain>/`)

```
index.ts            exports { resolver, typeDef } (typeDef comes from @repo/gql-typedefs)
resolver.ts         GraphQL resolvers, thin: validate args, call controller
controller.ts       database access (Mongoose), caching, business rules
formatter.ts        DB document -> GraphQL type (only when shapes differ)
routes.ts           optional plain Express routes (redirects, beacons, proxies)
jobs/               optional background jobs started from bootstrap/loaders/index.ts
generated-types/    GENERATED by `npm run generate`; never edit
generated-typedefs/ GENERATED copy of the schema file; never edit
```

Adding a GraphQL field: edit `packages/gql-typedefs/<domain>.ts` -> `npm run generate`
-> implement resolver/controller -> add the frontend operation in
`apps/<app>/src/lib/api/<domain>.ts` -> `npm run generate` (frontend types) ->
`npm run generate:operations` -> commit everything including the allowlist.

## Frontend pattern (`apps/frontend/src/`)

```
app/            pages and page-scoped components (one folder per route)
components/     reusable Berkeleytime-specific components (ClassCard, ClassBrowser, ...)
hooks/api/      one hook per operation, wrapping Apollo useQuery/useMutation
lib/api/        gql`` operations, one file per domain
lib/generated/  GENERATED client types (git-ignored, produced by npm run generate)
providers/      UserProvider, TrackingProvider
contexts/, lib/, utils/
```

- Use the generated `...Document` with `useQuery`/`useMutation`. Never pass raw
  query strings.
- Styling: SCSS modules (`Component.module.scss`), `classnames` for conditional
  classes, components and tokens from `@repo/theme` first. Colors and type come
  from CSS variables in `packages/theme/src/components/ThemeProvider/ThemeProvider.scss`;
  spacing uses Radix `--space-*`. No raw hex in component styles. Check light and dark mode.
- Generic reusable UI goes in `packages/theme`; Berkeleytime-specific reusable UI
  in `apps/frontend/src/components`; page-only UI stays under `app/`.
- `app/_legacy/` holds the previous Grades and Enrollment pages. The legacy
  Grades page is still what `/grades` serves (see `App.tsx`). Do not delete
  without checking the routes.

## Authentication and authorization (read before touching any resolver)

- Sessions come from Passport (Google OAuth) stored in Redis.
- The `@auth` schema directive only checks that a user is signed in. It does
  **not** check ownership or staff role.
- Anything user-owned (schedules, plans, collections, ratings) must also scope
  the query to the caller in the controller, e.g. `createdBy: context.user._id`.
  Authentication plus a caller-supplied record ID is never enough.
- Staff-only operations use the existing staff checks
  (`apps/backend/src/modules/analytics/helpers/staff-auth.ts` pattern). Public
  catalog, class, grade, enrollment, term and rating reads stay public.
- Error codes in use: `UNAUTHENTICATED`, `FORBIDDEN`, `BAD_USER_INPUT`,
  `INVALID_ARGUMENT`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_SERVER_ERROR`. Keep the
  code the neighboring controller already uses. Throw `GraphQLError`; do not
  swallow errors in empty `catch` blocks.

## Rules of the road

1. Follow the nearest existing module, page or component. Match its naming,
   error handling and file layout before inventing a new pattern.
2. Keep changes to the task. No drive-by refactors, new dependencies or new
   abstractions unless the task needs them; say so in the PR if it does.
3. Never hand-edit anything under `generated*/`, `dist/`, or
   `apps/semantic-search/app/generated_operations.py`. Change the source and regenerate.
4. `npm run check` must pass before you push. CI runs the same gate and blocks
   the merge otherwise.
5. Tests live next to the code: `*.test.ts` (backend uses `node:test` via `tsx`,
   frontend uses Vitest). Add one when you fix a bug or add logic.
6. Secrets never go in the repo. Local secrets are generated into `.env`;
   production secrets are SealedSecrets under `infra/*/templates/`.
7. Prettier owns formatting (`.prettierrc`, imports are auto-sorted;
   side-effect imports such as `import "./instrumentation"` stay where written).
8. Docs are part of the change: update `apps/docs` and this file when behavior,
   commands or structure change.
9. Read every line of AI-generated code before committing it. If you cannot
   explain a line in review, it does not ship.

## Known traps

- Fresh clone: run `npm run generate` before `type-check` or your editor will
  show missing `@repo/sis-api/*` modules; `dist/` is generated.
- `apps/backend/src/main.ts` must import `./instrumentation` first; the
  OpenTelemetry SDK patches `http` before Express loads.
- `semantic-search` reads the catalog through the same persisted-operation
  gateway; its two documents live in `apps/semantic-search/app/graphql/`.
- Only `DEV_PORT_PREFIX` 30 and 80 are registered with Google OAuth.
- `staff-frontend` is still on Apollo Client 3 while every other app is on 4;
  import paths differ (`@apollo/client` vs `@apollo/client/react`).
- The `trackView` variable in `components/Class/index.tsx` is a legacy per-class
  view counter, not the tracking pipeline (see `.claude/skills/add-analytic`).

## Where to read more

- Developer docs site source: `apps/docs/src/` (local dev, backend, frontend,
  datapuller, infrastructure, runbooks, testing, decision log).
- Security boundary: `docs/security/public-graphql-boundary.md`.
- Contribution flow: `CONTRIBUTING.md`.
- Repeatable agent recipes: `.claude/skills/` (e.g. `add-analytic`).
