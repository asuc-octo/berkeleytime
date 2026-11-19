# Profile degree migration

Run this once **before profile editing/onboarding is enabled**. GradTrak's valid,
nonempty majors/minors replace both empty fields and populated legacy account
values. These are suggestions for the user to confirm or change during onboarding.
Then the script normalizes remaining legacy profile values for all users,
including users without plans and fields with no GradTrak choice. Existing
canonical values are retained. Creating or editing a GradTrak plan does not write
to the account.

## Legacy cleanup

The following exact aliases have a confident match in the current vocabulary:

| Legacy name                | Canonical name                                    |
| -------------------------- | ------------------------------------------------- |
| EECS                       | Electrical Engineering & Computer Sciences (EECS) |
| IEOR                       | Industrial Engineering & Operations Research      |
| Film                       | Film & Media                                      |
| Chicanx and Latinx Studies | Chicanx Latinx Studies                            |

Mapping is allowed only when the destination belongs to the field's vocabulary.
For example, `Film` can be mapped in majors but not minors. The cleanup retains
valid entries in mixed arrays and deduplicates arrays it changes. It clears only
unresolved entries, never invents a specialization, and never moves a major entry
to minors. Missing/null/empty fields stay as they are; malformed fields become
empty arrays with the original value archived.

The October 14 audit found 37 distinct noncanonical names across all accounts
(36 among users without plans). Four are mapped above. The other 33 are cleared
when they remain in the profile after the GradTrak prefill:

- **Broad, ambiguous, or not represented in the major list:** Classical Languages,
  Classical Civilizations, Nutritional Sciences, Nutritional Sciences: Dietetics,
  Biology + Business, Life Sciences, Business, and Entrepreneurship, Geosystems,
  GIS, Operations Research & Management Science.
- **Recognized as minors, not majors, by this PR's vocabulary:** Environmental
  Engineering, Arabic, City Planning, Structural Engineering, Earth and Planetary
  Science, Energy and Resources, Electronic Intelligent Systems, Public Policy,
  Creative Writing, Sustainable Design, Journalism, Jewish Studies, Russian
  Language, Politics, Philosophy, and Law, Geotechnical Engineering, History of
  the Built Environment, Hispanic Languages, Linguistics, and Bilingualism,
  Digital Humanities, Science and Math Education, Applied Language Studies, Tibetan.
- **Certificates outside the major/minor lists:** Professional Accountancy,
  New Media, Entrepreneurship & Technology.

This is a review against the existing PR vocabulary, not a claim that these
programs never existed. In particular, [Operations Research and Management
Science is a distinct major from IEOR](https://guide.berkeley.edu/undergraduate/degree-programs/industrial-engineering-operations-research/),
so it must not be silently mapped to IEOR. The [Chicanx Latinx Studies department](https://ethnicstudies.berkeley.edu/areas-of-study/area/chicano-latino-studies)
also uses the longer legacy spelling in its description. The [Film department's
catalog entry](https://digicoll.lib.berkeley.edu/record/1682/files/2011_2013_courses.pdf)
describes the undergraduate degree as film.

Changed profiles receive `_migrations.canonicalProfileDegreesV1` atomically with
the cleaned values. It archives the original arrays (including missing vs null),
mapped/removed entries and reasons, proposed canonical values, timestamp, and
`confirmed: false`. If GradTrak first replaced a legacy value, its original is
retained in the GradTrak record instead. These are provenance records, not user
confirmation. A later onboarding prompt can ask users to choose a current major.

Cleanup completion records and concurrent edits are respected on retries. A
GradTrak conflict record also prevents cleanup from changing that account. Final
verification reports any remaining invalid profiles, including skipped conflicts;
review these before launch. In dry run, cleanup and final verification use the
projected GradTrak values, so overwritten legacy entries are not double-counted.

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

The tests create and drop their own randomly named databases. They check populated
replacements, empty/null/absent fields, invalid values, no-plan/empty-plan users,
read-only dry runs, atomic write races, and retries after profile/plan changes.
The cleanup test additionally checks accounts without plans, mixed arrays,
ambiguous removals, archive contents, correct GradTrak precedence, and verification
of every resulting major/minor against the field's canonical list.
