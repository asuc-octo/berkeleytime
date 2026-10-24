# Architecture Decision Log

Short records of the decisions that shape the codebase, so the next team knows
what was deliberate and what is just history. Add an entry when you make a
choice that a future contributor would otherwise have to reverse-engineer.
Format: context, decision, consequences, where to look.

## ADR-001: Monorepo with npm workspaces and Turborepo

- **Context**: several deployables (API, SPA, data loader, internal dashboards) share models, the GraphQL schema and a design system.
- **Decision**: one repository, `apps/*` and `packages/*` workspaces, Turborepo for task orchestration, packages consumed as TypeScript source (no build step for libraries).
- **Consequences**: one `npm install`, atomic cross-service changes, but every app's type-check depends on generated code existing (`npm run generate`). Turbo caching is disabled for checks to avoid stale results from cross-package source imports.
- **Where**: `package.json`, `turbo.json`, `packages/*/package.json` (`exports` point at `.ts`).

## ADR-002: GraphQL API with a schema in `packages/gql-typedefs`

- **Decision**: Apollo Server, schema written in SDL per domain and shared with the frontends; types generated on both sides with GraphQL Code Generator.
- **Consequences**: end-to-end types, but two generation steps to remember (`npm run generate` for types, `npm run generate:operations` for the allowlist).

## ADR-003: Public GraphQL is a persisted-operation gateway (August 2026)

- **Context**: the raw `/api/graphql` endpoint exposed the whole schema to anyone, which conflicted with campus data redistribution terms and enabled abuse.
- **Decision**: clients send a hash of a committed operation; the server executes only allowlisted documents. CORS and headers are not treated as security.
- **Consequences**: adding an operation is a reviewed, public-surface change; rolling the backend back before this change reopens the raw endpoint (treat as a security change). Internal consumers (semantic search) follow the same path.
- **Where**: `docs/security/public-graphql-boundary.md`, `apps/backend/src/bootstrap/graphql/persistedOperationGateway.ts`, `packages/shared/persistedOperationFetch.ts`.

## ADR-004: Backend module layout (resolver, controller, formatter)

- **Decision**: one folder per domain with a fixed set of files; `graphql-modules` codegen preset gives each module its own types.
- **Consequences**: predictable place for everything; some duplication between formatters. Authorization lives in controllers, not in the `@auth` directive.
- **Where**: `apps/backend/src/modules/`, `AGENTS.md`.

## ADR-005: Datapuller as independent CronJobs

- **Context**: a single nightly script could not refresh enrollment every 15 minutes while refreshing courses twice a day.
- **Decision**: one entrypoint, one puller per data type, one Kubernetes CronJob per puller with its own schedule.
- **Where**: `apps/datapuller/src/main.ts`, `infra/app/values.yaml` (`datapuller.cronjobs`), `infra/app/templates/datapuller.yaml`.

## ADR-006: Denormalized `catalog_classes` collection

- **Context**: catalog search joined courses, classes, sections, grades and ratings per request.
- **Decision**: the datapuller writes a flattened `catalog_classes` document per class per term; the catalog module queries only that collection.
- **Consequences**: fast search, but a second source of truth that must be refreshed after pulls (`catalog-sync-grades`, `scripts/rebuild-catalog.ts`).
- **Where**: `apps/datapuller/src/lib/catalog-denormalize.ts`, `packages/common/src/models/catalog-class.ts`, `apps/backend/src/modules/catalog/`.

## ADR-007: GradTrak requirements as an interpreted DSL (BtLL)

- **Context**: degree requirements are nested boolean/count/unit rules that change every year and should be editable without a deploy.
- **Decision**: a small typed language interpreted in TypeScript; requirement programs are stored in MongoDB (`planrequirements`) and authored in `packages/BtLL/reference_gradtrak_reqs.ts`.
- **Consequences**: flexible, but a bespoke language has a learning curve and limited tooling. Programs are data; changing them is a migration (`migrations/seed-requirements.js`).
- **Where**: `packages/BtLL/`, docs page "@repo/BtLL".

## ADR-008: React SPA without a meta-framework

- **Decision**: Vite + React Router SPA served as static files; no server rendering.
- **Consequences**: simple hosting and a familiar stack for students; SEO and first paint depend on the client. Revisit only with a concrete need.

## ADR-009: Single-node Kubernetes at the OCF, Helm per service

- **Context**: Berkeleytime runs on donated hardware (`hozer-51`) with no cloud budget.
- **Decision**: kubeadm cluster, MetalLB, ingress-nginx, cert-manager, sealed-secrets; one Helm chart per deployable; images and charts published to Docker Hub by GitHub Actions; deploys are `helm upgrade` over SSH.
- **Consequences**: cheap and transparent, but a single point of failure and tight memory budgets (see observability limits). Backups go to Cloudflare R2 with tiered retention.
- **Where**: `infra/`, `.github/workflows/cd-*.yaml`, docs "Infrastructure".

## ADR-010: Run TypeScript directly in production with `tsx`

- **Decision**: no compile step; containers run `tsx src/main.ts`.
- **Consequences**: simpler images and identical dev/prod code paths, at the cost of slower cold starts and a dev-sized image. Acceptable at current scale.

## ADR-011: First-party event tracking pipeline (September 2026)

- **Decision**: a generic `trackEvents` mutation buffered in Redis and flushed to the `trackingevents` collection, surfaced in the staff dashboard; no third-party analytics.
- **Where**: `.claude/skills/add-analytic/SKILL.md` (the most complete description), `apps/backend/src/modules/tracking/`.

## ADR-012: One quality gate, enforced in CI (October 2026)

- **Context**: lint was advisory, type-check and unit tests never ran in CI, and a merged PR carried a failing test for weeks.
- **Decision**: `npm run check` is the definition of "green" locally and in the `CI: Check Lint` job, which now blocks merges.
- **Where**: `package.json` (`check`), `.github/workflows/ci-lint.yaml`, `CONTRIBUTING.md`.
