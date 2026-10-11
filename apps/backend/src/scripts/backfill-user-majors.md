# GradTrak profile prefill migration

Run this once **before profile editing/onboarding is enabled**. GradTrak's valid,
nonempty majors/minors replace both empty fields and populated legacy account
values. These are suggestions for the user to confirm or change during onboarding.
Users without plans and fields with no GradTrak choice keep their existing values.
Creating or editing a GradTrak plan does not write to the account.

```sh
# Read-only preview; MONGODB_URI selects the database.
DRY_RUN=1 npm run migrate:user-majors --workspace=backend

# Apply only after reviewing the preview and coordinating the onboarding launch.
# Reuse the preview's cutoff to keep the same set of eligible plans.
BACKFILL_CUTOFF='<cutoff from the summary>' npm run migrate:user-majors --workspace=backend
```

The first live run stores a cutoff in `migrationRuns` under
`gradTrakDegreePrefillV1`. Retries reuse it, excluding subsequently created plans.
Each processed user gets `_migrations.gradTrakDegreePrefillV1` in the same atomic
write as their degree values. This record retains the previous values (including
null vs absent), the suggested values, plan ID, timestamp, and `confirmed: false`.
It is migration provenance, not a user answer. Even users whose values already
match, or whose plans have no degree choices, get a record so later plan changes
cannot resync on a retry. Already recorded users are always skipped.

The update matches the degree values read before writing. A concurrent profile
edit is preserved and recorded with status `skipped-concurrent-change`, so retries
also leave it alone. Review conflicts and invalid plan values before enabling
profile editing. The current application has no
onboarding confirmation/decline fields: this script does not claim to recognize
them. If first execution or retries are delayed until after that feature launches,
add its actual answer-state checks before running against unprocessed users (B4).

Dry run uses the MongoDB driver directly and performs no writes, including index
or collection creation. Its output distinguishes empty fields filled, populated
fields replaced, unchanged users that would receive a completion record, and skip
reasons. Detailed change logs use user IDs rather than emails and include old/new
values; keep them with the migration's private operational records. The live run
does not change `updatedAt`, since this is not a user confirmation. The saved
previous values support a reviewed rollback; do not restore them over later edits.

For a disposable local MongoDB instance, run the integration test with:

```sh
BACKFILL_TEST_MONGODB_URI=mongodb://127.0.0.1:27018 \
  npx tsx --test apps/backend/src/scripts/backfill-user-majors.test.ts
```

The test creates and drops its own randomly named database. It checks populated
replacements, empty/null/absent fields, invalid values, no-plan/empty-plan users,
read-only dry runs, an atomic write race, and retries after profile/plan changes.
