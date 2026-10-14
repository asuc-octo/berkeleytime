import { Db, Filter } from "mongodb";

import { VALID_MAJORS, VALID_MINORS } from "@repo/common/lib/degreePrograms";

import {
  DegreeChanges,
  DegreeField,
  MIGRATION_ID,
  User,
  runDegreeBackfill,
} from "./backfill-user-majors-lib";

export const CLEANUP_ID = "canonicalProfileDegreesV1";
const MARKER = `_migrations.${CLEANUP_ID}`;
const FIELDS = ["majors", "minors"] as const;
const VOCABULARIES = { majors: VALID_MAJORS, minors: VALID_MINORS };

// Deliberate aliases only. Do not infer a user's specialization or move a
// certificate/minor into another field. See the runbook for reviewed names.
export const LEGACY_DEGREE_ALIASES: ReadonlyMap<string, string> = new Map([
  ["EECS", "Electrical Engineering & Computer Sciences (EECS)"],
  ["IEOR", "Industrial Engineering & Operations Research"],
  ["Film", "Film & Media"],
  ["Chicanx and Latinx Studies", "Chicanx Latinx Studies"],
]);

export function normalizeDegrees(value: unknown, field: DegreeField) {
  const vocabulary = VOCABULARIES[field];
  const values: string[] = [];
  const mapped: { from: string; to: string }[] = [];
  const removed: { value: unknown; reason: string }[] = [];
  if (value == null) return { values, mapped, removed, changed: false };
  if (!Array.isArray(value)) {
    return {
      values,
      mapped,
      removed: [{ value, reason: "malformed-degree-field" }],
      changed: true,
    };
  }
  for (const item of value) {
    if (typeof item === "string" && vocabulary.has(item)) {
      values.push(item);
      continue;
    }
    const canonical =
      typeof item === "string" ? LEGACY_DEGREE_ALIASES.get(item) : undefined;
    if (canonical && vocabulary.has(canonical)) {
      values.push(canonical);
      mapped.push({ from: item, to: canonical });
    } else {
      const otherVocabulary = field === "majors" ? VALID_MINORS : VALID_MAJORS;
      removed.push({
        value: item,
        reason:
          typeof item !== "string"
            ? "non-string-degree"
            : otherVocabulary.has(item)
              ? "valid-only-in-other-field"
              : "no-confident-canonical-match",
      });
    }
  }
  return {
    values: [...new Set(values)],
    mapped,
    removed,
    changed: mapped.length > 0 || removed.length > 0,
  };
}

function snapshot(user: User, field: DegreeField) {
  return Object.hasOwn(user, field)
    ? { present: true, value: user[field] }
    : { present: false };
}

function unchangedField(user: User, field: DegreeField): Filter<User> {
  return Object.hasOwn(user, field)
    ? { [field]: { $exists: true, $eq: user[field] } }
    : { [field]: { $exists: false } };
}

export async function normalizeUserDegrees(
  db: Db,
  options: {
    dryRun: boolean;
    log?: (message: string) => void;
    projectedChanges?: Map<string, DegreeChanges>;
  }
) {
  const users = db.collection<User>("users");
  const projectedChanges = options.dryRun
    ? (options.projectedChanges ?? new Map<string, DegreeChanges>())
    : undefined;
  const summary = {
    usersScanned: 0,
    usersWithChanges: 0,
    usersWithMappings: 0,
    usersWithRemovals: 0,
    usersLeftWithoutMajor: 0,
    majorEntriesMapped: 0,
    majorEntriesRemoved: 0,
    minorEntriesMapped: 0,
    minorEntriesRemoved: 0,
    skippedAlreadyCleaned: 0,
    skippedConcurrentChange: 0,
    skippedGradTrakConflict: 0,
    remainingInvalidUsers: 0,
    mappingCounts: {} as Record<string, number>,
    removalCounts: {} as Record<string, number>,
  };
  const cursor = users.find(
    {},
    { projection: { majors: 1, minors: 1, _migrations: 1 }, batchSize: 500 }
  );
  try {
    for await (const original of cursor) {
      summary.usersScanned++;
      const user = {
        ...original,
        ...projectedChanges?.get(original._id.toHexString()),
      };
      const normalized = {
        majors: normalizeDegrees(user.majors, "majors"),
        minors: normalizeDegrees(user.minors, "minors"),
      };
      const changes: DegreeChanges = {};
      for (const field of FIELDS)
        if (normalized[field].changed)
          changes[field] = normalized[field].values;
      if (!Object.keys(changes).length) continue;
      if (user._migrations && Object.hasOwn(user._migrations, CLEANUP_ID)) {
        summary.skippedAlreadyCleaned++;
        continue;
      }
      const gradTrakRecord = user._migrations?.[MIGRATION_ID] as
        | { status?: string }
        | undefined;
      if (gradTrakRecord?.status === "skipped-concurrent-change") {
        summary.skippedGradTrakConflict++;
        continue;
      }
      const record = {
        status: "applied",
        source: "legacy-profile",
        confirmed: false,
        previous: {
          majors: snapshot(user, "majors"),
          minors: snapshot(user, "minors"),
        },
        normalized: changes,
        reasons: {
          majors: {
            mapped: normalized.majors.mapped,
            removed: normalized.majors.removed,
          },
          minors: {
            mapped: normalized.minors.mapped,
            removed: normalized.minors.removed,
          },
        },
      };
      if (!options.dryRun) {
        const result = await users.updateOne(
          {
            _id: user._id,
            [MARKER]: { $exists: false },
            $and: FIELDS.map((field) => unchangedField(user, field)),
          },
          {
            $set: {
              ...changes,
              [MARKER]: { ...record, appliedAt: new Date() },
            },
          }
        );
        if (result.modifiedCount !== 1) {
          await users.updateOne(
            { _id: user._id, [MARKER]: { $exists: false } },
            {
              $set: {
                [MARKER]: {
                  ...record,
                  status: "skipped-concurrent-change",
                  recordedAt: new Date(),
                },
              },
            }
          );
          summary.skippedConcurrentChange++;
          continue;
        }
      }
      summary.usersWithChanges++;
      if (options.dryRun) {
        projectedChanges!.set(user._id.toHexString(), {
          ...projectedChanges!.get(user._id.toHexString()),
          ...changes,
        });
      }
      summary.usersWithMappings += Number(
        FIELDS.some((field) => normalized[field].mapped.length)
      );
      summary.usersWithRemovals += Number(
        FIELDS.some((field) => normalized[field].removed.length)
      );
      summary.usersLeftWithoutMajor += Number(
        normalized.majors.changed && !normalized.majors.values.length
      );
      summary.majorEntriesMapped += normalized.majors.mapped.length;
      summary.majorEntriesRemoved += normalized.majors.removed.length;
      summary.minorEntriesMapped += normalized.minors.mapped.length;
      summary.minorEntriesRemoved += normalized.minors.removed.length;
      for (const field of FIELDS) {
        for (const { from, to } of normalized[field].mapped) {
          const key = `${field}: ${from} → ${to}`;
          summary.mappingCounts[key] = (summary.mappingCounts[key] ?? 0) + 1;
        }
        for (const { value, reason } of normalized[field].removed) {
          const key = `${field}: ${typeof value === "string" ? value : "[malformed value]"} (${reason})`;
          summary.removalCounts[key] = (summary.removalCounts[key] ?? 0) + 1;
        }
      }
      options.log?.(
        JSON.stringify({
          userId: user._id,
          dryRun: options.dryRun,
          cleanup: record,
        })
      );
    }
  } finally {
    await cursor.close();
  }
  // Verify the resulting profile values, including accounts skipped due to a
  // completion record or race. Dry run verifies the proposed combined result.
  summary.remainingInvalidUsers = 0;
  const verification = users.find(
    {},
    { projection: { majors: 1, minors: 1 }, batchSize: 500 }
  );
  try {
    for await (const original of verification) {
      const user = {
        ...original,
        ...projectedChanges?.get(original._id.toHexString()),
      };
      if (
        FIELDS.some((field) => {
          const value = user[field];
          return (
            value != null &&
            (!Array.isArray(value) ||
              value.some(
                (item) =>
                  typeof item !== "string" || !VOCABULARIES[field].has(item)
              ))
          );
        })
      )
        summary.remainingInvalidUsers++;
    }
  } finally {
    await verification.close();
  }
  return summary;
}

export async function runProfileDegreeMigration(
  db: Db,
  options: {
    dryRun: boolean;
    cutoff?: Date;
    log?: (message: string) => void;
  }
) {
  const projectedChanges = options.dryRun
    ? new Map<string, DegreeChanges>()
    : undefined;
  const gradTrak = await runDegreeBackfill(db, {
    ...options,
    projectedChanges,
  });
  // In dry run, preview cleanup against the values GradTrak WOULD write. In a
  // live run, reread the values actually written, retaining GradTrak precedence.
  const legacyCleanup = await normalizeUserDegrees(db, {
    ...options,
    projectedChanges,
  });
  return {
    dryRun: options.dryRun,
    cutoff: gradTrak.cutoff,
    gradTrak,
    legacyCleanup,
  };
}
