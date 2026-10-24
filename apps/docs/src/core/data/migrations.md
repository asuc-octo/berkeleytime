# Migrations

Berkeleytime has no migration framework. Schema changes are usually additive
(Mongoose tolerates missing fields) and data backfills are plain `mongosh`
scripts kept in `migrations/` at the repository root.

## Two copies, one source

- `migrations/` is the **source of truth**. Write and review scripts here.
- `infra/mongo/migrations/` is a copy the `infra/mongo` Helm chart packages into
  a ConfigMap mounted at `/migrations` in the MongoDB pod. `migrations/run-migration.sh`
  refreshes the copy before upgrading the chart. CI runs `npm run check:migrations`
  and fails if the two directories differ (`cp migrations/*.js infra/mongo/migrations/` fixes it).

## Running one

```sh
# Production or staging, from a shell on hozer-51 at the repo root
./migrations/run-migration.sh add-selected-plan-requirements.js prod

# Local docker compose
docker compose exec mongodb mongosh "$MONGODB_URI" --eval 'load("/migrations/add-selected-plan-requirements.js")'
```

Scripts must be idempotent (use `updateOne` with `upsert`, check before insert)
because they will be re-run.

## GradTrak requirements are data

`migrations/seed-requirements.js` upserts the `planrequirements` collection. It is
generated from `packages/BtLL/reference_gradtrak_reqs.ts` with
`npm run generate:mongosh -w @repo/BtLL > migrations/seed-requirements.js`.
Edit the TypeScript source, regenerate, and commit both files.
