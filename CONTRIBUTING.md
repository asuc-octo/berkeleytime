# Contributing to Berkeleytime

The long version with screenshots is in the docs site under
[Getting Started > Contributing](https://docs.berkeleytime.com/getting-started/contributing.html).
This is the short version. Read `AGENTS.md` first.

## The loop

1. **Branch from `main`.** Name it `<you>/<ticket>-<short-slug>` (e.g. `ethan/ber-78-former-names`).
   One change per branch. If a PR would exceed roughly 400 changed lines, split it.
2. **Build it.** Follow the nearest existing pattern. Add or update a unit test
   next to the code. Update docs in the same PR when behavior, commands or
   structure change.
3. **Run the gate** before pushing: `npm run check`. It is the same gate CI
   runs. `npm run format` fixes formatting.
4. **Open a PR** using the template. Keep it in draft until CI matters to you;
   CI skips drafts. For UI, include light and dark screenshots. For anything
   worth clicking through, deploy it to development from Actions and link it.
5. **Review.** One approval from a pod lead or an experienced member. Reviewers
   read the diff, not the summary. AI-generated code is held to the same bar and
   the author must be able to explain every line.
6. **Merge with squash.** The PR title becomes the commit message, so write it
   as a changelog line: imperative, specific, ticket prefix when there is one.
7. **Verify on staging** (deploys automatically from `main`), then run
   "CD: Deploy to Production" from Actions when the change is ready for users.

## What CI enforces on every PR

- `CI: Check Lint` (blocking): persisted-operation allowlist is current,
  migration copies match, Prettier, TypeScript across all workspaces, ESLint,
  unit tests (backend, frontend, BtLL). It posts one comment per PR with the
  failing output.
- `CI: Check Build`: every production Docker image builds.
- `CI: GraphQL Boundary Tests`: Playwright sanity + API tests against a fresh
  `docker compose` stack.
- `CI: Compose Security`: local services stay bound to localhost with auth.

## Working with AI tools

`AGENTS.md` is the contract. Point the tool at it, give it the ticket, the files
involved and the pattern to copy, and constrain scope ("only the backend",
"do not touch generated files"). Then run `npm run check` and read the diff.
Do not merge code you could not have written yourself with more time.

## Things that need a human decision

- Changing the public GraphQL surface (new operations are reviewed as a product
  decision, see `docs/security/public-graphql-boundary.md`).
- Anything under `infra/` for production. Use `/helm-diff` in the PR to preview.
- Adding a dependency, a new service, or a new database collection.
