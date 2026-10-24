# Codebase and CI/CD audit, October 24, 2026

Scope: the whole monorepo at `main` (commit `243dd18`), every GitHub Actions
workflow, Dockerfiles and compose, the docs site, and the GitHub state (open
PRs, recent CI runs). Method: read every config and workflow, sample each app,
and run the toolchain on a fresh clone the way a new member would. Everything
marked **fixed** is in the same change as this report; everything else is a
prioritized backlog.

## Headline

The application code is in better shape than its process. Lint is clean,
TypeScript is strict, the public GraphQL boundary is well designed and tested.
The risks were around the code:

1. **CI enforced almost nothing.** The lint check was literally annotated "The
   status check will always pass". Type-check, Prettier and unit tests never ran
   in CI. A failing frontend test was merged on October 1 (PR 1220) and stayed
   red for three weeks; four files on `main` were unformatted.
2. **A fresh clone did not type-check.** The generated SIS API client was never
   produced by `npm run generate`, so every new laptop saw "cannot find module
   @repo/sis-api".
3. **Documentation described a repository that no longer exists in places**
   (Postgres and Django setup guide at the root, a `config.ts` that moved years
   ago, a `queries.ts` that was deleted, macOS-only commands in a guide that
   says it supports Linux), and there was no shared context file for the AI
   tools the team now writes most code with.
4. **Operational drift**: a migration script copy a month behind its source,
   two Docker images floating on `node:alpine`, `turbo@latest` in eight images,
   a dev nginx from 2021, Dependabot watching a Docker directory with no
   Dockerfile and no npm at all, a `/helm-diff` command that could not work from
   a PR comment, about 50 open PRs and 225 remote branches.

## Fixed in this change

| Priority | Finding | Fix |
| --- | --- | --- |
| P0 | `CI: Check Lint` passed regardless of lint result (`continue-on-error`) | Blocking job. Still named "Lint Codebase" so an existing branch protection rule keeps working. Posts one updating comment per PR with the failing output. |
| P0 | Type-check, Prettier and unit tests (backend, frontend, BtLL) never ran in CI | All run in the same job; `npm run check` runs the identical gate locally |
| P0 | Fresh clone fails `type-check` (SIS client in `packages/sis-api/dist` never generated) | `generate` script added to `sis-api`; turbo `type-check` and `test` depend on `generate` |
| P0 | Frontend test failing on `main` since PR 1220 (palette expects Slate, code ships Gray) | Test aligned to shipped behavior; product decision flagged below |
| P1 | `/helm-diff` PR comment trigger used an undefined input (`refs/pull//head`) | PR number taken from the comment's issue when not dispatched |
| P1 | Import sorter moved side-effect imports: frontend OpenTelemetry loaded after the Apollo client module, backend `main.ts` could not be formatted | `importOrderSideEffects: false`; instrumentation is the first import in both entrypoints; 17 files reformatted (whitespace only) |
| P1 | `infra/mongo/migrations/seed-requirements.js` one month behind `migrations/` (different wording, two colleges missing) | Synced; `npm run check:migrations` added to the gate |
| P1 | `ag-frontend` and `staff-frontend` images on unpinned `node:alpine`; all images install `turbo@latest`; dev nginx 1.21 (EOL 2022) | `node:22-alpine`, `turbo@2.5.8` (workspace version), `nginx:1.28-alpine` |
| P1 | Dependabot covered only GitHub Actions and an empty Docker directory | Weekly grouped updates for npm (root and Cloudflare worker), pip, every app Dockerfile, docker-compose, actions |
| P1 | `cd-stage` redeployed six images for docs-only pushes (ignored `docs/**`, docs live in `apps/docs/**`) | Docs, Storybook and CI-only paths ignored |
| P1 | Dead config and stray dependencies: unused Babel config and three `@babel/*` packages, three accidental root runtime deps, `@types/*` in `dependencies`, `vitest` used but undeclared, duplicate `patch-package`, patch named for graphql-modules 2.3.0 with 3.0.0 installed, codegen pointing at a deleted file, `.graphqlrc.yml` pointing at a path from the old repo layout, empty `git` file, obsolete `setup.md` | Removed or corrected; lockfile shrank by 93 packages |
| P1 | `.gitignore` ignored `.claude/` while a skill is tracked there | Only per-user runtime files ignored; `.claude/skills/` tracked |
| P1 | Node version hardcoded in three workflows; bootstrap used `nvm install --lts` (now Node 24) | `.nvmrc` = 22; CI and bootstrap read it |
| P1 | Action versions inconsistent (ssh-action 1.2.0 and 1.2.5, github-script v6 and v7); no `permissions:` blocks | Aligned to the versions Dependabot proposed; least-privilege permissions on CI workflows |
| P2 | No shared context for humans or agents beyond a Cursor-only `.cursorrules` with a path typo | `AGENTS.md` is canonical; `CLAUDE.md` imports it; `.cursorrules` points to it. Authorization rules from the open PR 1222 folded in |
| P2 | Root README was ten lines; no CONTRIBUTING, SECURITY, PR template or CODEOWNERS | All added (CODEOWNERS as a commented draft until teams exist) |
| P2 | Docs site: broken edit links, wrong paths and ports, wrong datapuller list, references to deleted code, nonexistent `config.ts`, macOS-only `date -v` | Fixed; new pages for semantic search, AG dashboard, observability, testing, migrations and an architecture decision log; contributing page is now the standard workflow |
| P2 | `packages/theme` (7.5k lines) and `packages/common` (3.5k) never type-checked by turbo | `type-check` scripts added; both pass |
| P2 | Bootstrap script lived inside the docs folder and broke on Linux (`date -v`) | Moved to `scripts/`, portable date, reads `.nvmrc` |

## Backlog, prioritized

| Priority | Item | Why | Suggested owner |
| --- | --- | --- | --- |
| P0 | Turn on branch protection (or a ruleset) for `main`: require `Lint Codebase`, the six `Build Image` jobs, `Sanity and API Tests`, `Check local-service exposure`; one approval; squash merge only; delete branch on merge | Without it every check in this change is advisory | Leads (repo admin) |
| P0 | Tests: 11 test files cover about 107k lines. `apps/datapuller` (5.5k lines, pure parsers over SIS payloads) and `apps/semantic-search` have none; controllers with ownership logic (schedule, plan, collection, rating) are untested | The gate now runs tests; there are few to run | Backend pod |
| P1 | Triage the ~50 open PRs and 225 remote branches. PR 1222 (agent rules) and 1223 (frontend docs) overlap this change: fold or close. Four Dependabot action PRs are now redundant | Review debt hides real work | Leads |
| P1 | `staff-frontend` is on Apollo Client 3 while every other app is on 4 | Two import conventions in one repo; blocks sharing hooks | Staff tools pod |
| P1 | Semantic search default term is hardcoded to Spring 2026 in `docker-compose.yml` and `infra/app/values.yaml`; it is now Fall 2026 | Fallback only, but it rots every semester; derive from the terms collection or make it a documented per-semester task | Backend pod |
| P1 | Production images are the dev image plus a build: full devDependencies and source inside, `npm install` instead of `npm ci` | Image size, reproducibility | Infra pod |
| P1 | Decide `/grades`: the legacy page is served at `/grades`, the redesign at `/grades-new` (`App.tsx`) | Two pages to maintain | Frontend pod |
| P1 | Dead cache-warming server (`apps/backend/src/modules/cache`, `CACHE_WARMING_PORT`, port 8080 in the Helm chart) is never started | Confuses readers; exposes an unused port | Backend pod |
| P2 | Palette: PR 1220 shipped Gray as the tenth schedule color while its test expected Slate | Product call; the test now matches what shipped | Design |
| P2 | Lint debt: `datapuller` disables `no-explicit-any` entirely (17 `any`); 20 `no-explicit-any` and 23 `css-modules/no-unused-class` disables; 58 TODOs, 52 `console.log` | Type safety erodes where the data enters | Pods |
| P2 | Files over 1,000 lines: staff analytics components (1.2k to 2.3k each), `rating/controller.ts` (1.5k), `Schedule/Editor/index.tsx` (1.3k), `Dashboard/index.tsx` (1.3k) | Hard to review and to hand over | Pods |
| P2 | Three identical hook files duplicated across frontend, ag and staff; staff and ag hand-write GraphQL types without codegen | Drift | Frontend pod |
| P2 | Python service has no lint (ruff) or tests | Parity with the TypeScript gate | Backend pod |
| P2 | Turbo caching is off for lint and type-check (correct, because packages are imported as source) | Slower local loops; enable with `inputs` that include dependency sources | Infra pod |
| P2 | Versions: Helm 3.10.2 in `helm-diff`, OTel collector 0.96.0, cluster components pinned in `infra/init.sh` from 2024; Node 22 maintenance ends April 2027 | Plan upgrades on a cadence instead of on failure | Infra pod |
| P2 | `cd-prod` "branch-check" job is an `echo`; the real gate is the `production` environment | Misleading name; document or remove | Infra pod |

## Decisions the club has to make (settings this change cannot touch)

- [ ] Branch protection as above. Consider also "require conversation resolution".
- [ ] Create GitHub teams per pod and uncomment `.github/CODEOWNERS`.
- [ ] Enable private vulnerability reporting (Security tab) so `SECURITY.md` has a real inbox.
- [ ] Close or rebase PR 1222 and PR 1223 against `AGENTS.md` and the new frontend docs.
- [ ] Gray or Slate as the tenth schedule color.
- [ ] Which Grades page survives.
- [ ] Who refreshes the semantic search default term each semester, or fund the small change to derive it.

## Snapshot

| Measure | Value |
| --- | --- |
| Source lines (ts/tsx/py/scss, excluding generated) | about 107,000: frontend 60k, backend 17k, staff 16k, theme 7.6k, BtLL 6k, datapuller 5.5k, common 3.5k, ag 2.9k, schema 2.7k, semantic search 0.8k |
| Test files | 11 (5 unit, 6 Playwright) |
| Checks that blocked a merge before / after | 1 (persisted-operation allowlist, inside a non-blocking job) / 7 |
| Dependabot ecosystems before / after | 2 (one empty) / 6 |
| Open PRs / remote branches | about 50 / 225 |
| `any` occurrences / `eslint-disable` / TODO | 105 / 52 / 58 |
| Contributors since August 2026 | 13 |

## The standard development flow

Documented in full at `apps/docs/src/getting-started/contributing.md` and in
`CONTRIBUTING.md`. In one breath: branch from `main` named
`<you>/<ticket>-<slug>`; copy the nearest pattern (`AGENTS.md`); add a test and
update docs in the same PR; `npm run check` green locally; open a PR with the
template, drafts skip CI; one approval from a pod lead with CODEOWNERS routing;
squash merge with an imperative title; staging deploys itself; verify, then run
"CD: Deploy to Production". AI tools get the ticket, the files, the pattern and
the constraint, then the author reads every line. Leads spend thirty minutes a
week on Dependabot, stale PRs and branches.

## Verification performed

- `npm ci` on a clean checkout, then `npm run check`: allowlist and migration
  checks pass, Prettier clean, 11 type-check tasks pass, 5 lint tasks pass,
  28 frontend and 8 backend unit tests plus the BtLL suite pass.
- Every workflow and the Dependabot file parse as YAML; action versions listed.
- All relative links in the docs site resolve (one intentional placeholder in a
  how-to example).
- Not verified here: Docker image builds (no daemon in this environment); the
  `CI: Check Build` workflow on the PR covers them.
