# Berkeleytime

[berkeleytime.com](https://berkeleytime.com) is UC Berkeley's student-run course
discovery and planning platform: catalog search, grade distributions, enrollment
history, class ratings, schedule planning, and degree planning (GradTrak).
Created by [Yuxin Zhu](http://yuxinzhu.com/) and [Noah Gilmore](https://noahgilmore.com),
maintained by the [ASUC Office of the CTO](https://octo.asuc.org/).

## Start here

| I want to... | Go to |
| --- | --- |
| Run it locally | `bash scripts/bootstrap-local.sh`, then [Local Development](https://docs.berkeleytime.com/getting-started/local-development.html) |
| Understand the codebase | [`AGENTS.md`](AGENTS.md) (repo map, patterns, rules, traps) |
| Ship a change | [`CONTRIBUTING.md`](CONTRIBUTING.md) and the [development workflow](https://docs.berkeleytime.com/getting-started/contributing.html) |
| Learn how a part works | [docs.berkeleytime.com](https://docs.berkeleytime.com) (source in `apps/docs/src`) |
| Change the public GraphQL API | [`docs/security/public-graphql-boundary.md`](docs/security/public-graphql-boundary.md) |
| Operate production | [Runbooks](https://docs.berkeleytime.com/core/infrastructure/runbooks.html) |
| Report a security issue | [`SECURITY.md`](SECURITY.md) |

## What is in the box

```
apps/        backend (GraphQL API), frontend (React SPA), datapuller (SIS -> MongoDB),
             semantic-search (Python), staff-frontend, ag-frontend, docs, storybook, api-sandbox
packages/    common (Mongoose models + utils), gql-typedefs (schema), shared, theme (design system),
             BtLL (GradTrak requirement language), sis-api (generated SIS clients), lint/ts presets
infra/       Helm charts for every service plus the single-node Kubernetes cluster at the OCF
migrations/  mongosh migration scripts        tests/   Playwright sanity, API and e2e tests
scripts/     bootstrap and repo check scripts  docs/    security boundary and audits
```

One quality gate runs locally and in CI:

```sh
npm run check   # persisted-operation allowlist, migration sync, prettier, type-check, lint, unit tests
```

## Environments

| Environment | URL | How it deploys |
| --- | --- | --- |
| Development | `<sha>.dev.berkeleytime.com` | Manually from Actions ("CD: Deploy to Development"), time-limited |
| Staging | staging.berkeleytime.com | Automatically on every merge to `main` |
| Production | berkeleytime.com | Manually from Actions ("CD: Deploy to Production"), gated by the `production` environment |

Security-sensitive GraphQL changes must follow the
[public GraphQL trust-boundary guide](docs/security/public-graphql-boundary.md).
