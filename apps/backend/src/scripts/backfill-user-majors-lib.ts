import { Db, Filter, ObjectId } from "mongodb";

import { VALID_MAJORS, VALID_MINORS } from "@repo/common/lib/degreePrograms";

export const MIGRATION_ID = "gradTrakDegreePrefillV1";
const MARKER = `_migrations.${MIGRATION_ID}`;
const BATCH_SIZE = 500;
const FIELDS = ["majors", "minors"] as const;
type DegreeField = (typeof FIELDS)[number];

type Plan = {
  _id: ObjectId;
  userEmail: string;
  majors?: unknown;
  minors?: unknown;
  createdAt: Date;
};

type User = {
  _id: ObjectId;
  email: string;
  majors?: unknown;
  minors?: unknown;
  _migrations?: Record<string, unknown>;
};

type MigrationRun = { _id: string; cutoff: Date };

export type BackfillOptions = {
  dryRun: boolean;
  cutoff?: Date;
  log?: (message: string) => void;
};

function validDegrees(
  value: unknown,
  vocabulary: ReadonlySet<string>
): string[] | null {
  if (value == null) return [];
  if (!Array.isArray(value)) return null;
  if (
    !value.every((item) => typeof item === "string" && vocabulary.has(item))
  ) {
    return null;
  }
  return [...new Set(value)];
}

function sameDegrees(left: unknown, right: string[]) {
  return (
    Array.isArray(left) &&
    left.length === right.length &&
    right.every((value) => left.includes(value))
  );
}

function snapshot(user: User, field: DegreeField) {
  return Object.hasOwn(user, field)
    ? { present: true, value: user[field] }
    : { present: false };
}

// Match the exact value read, including the difference between null and absent.
function unchangedField(user: User, field: DegreeField): Filter<User> {
  return Object.hasOwn(user, field)
    ? { [field]: { $exists: true, $eq: user[field] } }
    : { [field]: { $exists: false } };
}

export async function runDegreeBackfill(db: Db, options: BackfillOptions) {
  const log = options.log ?? (() => {});
  const plans = db.collection<Plan>("plans");
  const users = db.collection<User>("users");
  const runs = db.collection<MigrationRun>("migrationRuns");
  const existingRun = await runs.findOne({ _id: MIGRATION_ID });
  if (
    existingRun &&
    options.cutoff &&
    existingRun.cutoff.getTime() !== options.cutoff.getTime()
  ) {
    throw new Error(
      "BACKFILL_CUTOFF differs from the original migration cutoff"
    );
  }
  let cutoff = existingRun?.cutoff ?? options.cutoff ?? new Date();
  if (Number.isNaN(cutoff.getTime()))
    throw new Error("Invalid migration cutoff");

  // Save the cutoff only on a live run. Retries cannot enroll newer plans.
  // Even plans with no degrees get a record, so later plan edits cannot resync.
  const planFilter = { createdAt: { $lte: cutoff } };
  const duplicate = await plans
    .aggregate([
      { $match: planFilter },
      { $group: { _id: "$userEmail", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $limit: 1 },
    ])
    .next();
  if (duplicate)
    throw new Error("Resolve duplicate plan.userEmail values first");
  const missingDates = await plans.countDocuments({
    createdAt: { $not: { $type: "date" } },
  });
  if (missingDates)
    throw new Error(
      `${missingDates} plans have no valid createdAt; audit before running`
    );

  if (!options.dryRun) {
    const run = await runs.findOneAndUpdate(
      { _id: MIGRATION_ID },
      { $setOnInsert: { cutoff } },
      { upsert: true, returnDocument: "after" }
    );
    cutoff = run!.cutoff;
    planFilter.createdAt.$lte = cutoff;
  }

  const summary = {
    dryRun: options.dryRun,
    cutoff: cutoff.toISOString(),
    plansScanned: 0,
    usersWithChanges: 0,
    usersRecordedUnchanged: 0,
    majorFieldsFilled: 0,
    majorFieldsReplaced: 0,
    minorFieldsFilled: 0,
    minorFieldsReplaced: 0,
    skippedNoUser: 0,
    skippedAlreadyMigrated: 0,
    skippedInvalidValue: 0,
    skippedConcurrentChange: 0,
  };

  async function processBatch(batch: Plan[]) {
    const matchedUsers = await users
      .find(
        { email: { $in: batch.map((plan) => plan.userEmail) } },
        { projection: { email: 1, majors: 1, minors: 1, [MARKER]: 1 } }
      )
      .toArray();
    const byEmail = new Map(matchedUsers.map((user) => [user.email, user]));
    for (const plan of batch) {
      summary.plansScanned++;
      const user = byEmail.get(plan.userEmail);
      if (!user) {
        summary.skippedNoUser++;
        continue;
      }
      if (user._migrations && Object.hasOwn(user._migrations, MIGRATION_ID)) {
        summary.skippedAlreadyMigrated++;
        continue;
      }
      const majors = validDegrees(plan.majors, VALID_MAJORS);
      const minors = validDegrees(plan.minors, VALID_MINORS);
      if (!majors || !minors) {
        summary.skippedInvalidValue++;
        log(
          JSON.stringify({ planId: plan._id, reason: "invalid degree values" })
        );
        continue;
      }

      const suggestions = { majors, minors };
      const changes: Partial<Record<DegreeField, string[]>> = {};
      const replaced: DegreeField[] = [];
      const filled: DegreeField[] = [];
      for (const field of FIELDS) {
        const values = suggestions[field];
        // No plan choice is not evidence that a legacy answer should be erased.
        if (!values.length || sameDegrees(user[field], values)) continue;
        changes[field] = values;
        const previous = user[field];
        if (previous == null || (Array.isArray(previous) && !previous.length)) {
          filled.push(field);
        } else {
          replaced.push(field);
        }
      }

      const marker = {
        status: "applied",
        source: "gradtrak",
        confirmed: false,
        planId: plan._id,
        previous: {
          majors: snapshot(user, "majors"),
          minors: snapshot(user, "minors"),
        },
        suggested: suggestions,
      };
      if (!options.dryRun) {
        // Write values and completion record atomically; later retries skip this
        // user even if their profile or plan has changed since the initial run.
        const result = await users.updateOne(
          {
            _id: user._id,
            [MARKER]: { $exists: false },
            $and: FIELDS.map((field) => unchangedField(user, field)),
          },
          {
            $set: {
              ...changes,
              [MARKER]: { ...marker, appliedAt: new Date() },
            },
          }
        );
        if (result.modifiedCount !== 1) {
          // Remember the conflict without changing degrees. A blind retry must
          // not treat this user's intervening choice as legacy data again.
          await users.updateOne(
            { _id: user._id, [MARKER]: { $exists: false } },
            {
              $set: {
                [MARKER]: {
                  ...marker,
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

      if (Object.keys(changes).length) summary.usersWithChanges++;
      else summary.usersRecordedUnchanged++;
      summary.majorFieldsFilled += Number(filled.includes("majors"));
      summary.majorFieldsReplaced += Number(replaced.includes("majors"));
      summary.minorFieldsFilled += Number(filled.includes("minors"));
      summary.minorFieldsReplaced += Number(replaced.includes("minors"));
      if (Object.keys(changes).length) {
        log(
          JSON.stringify({
            userId: user._id,
            dryRun: options.dryRun,
            previous: marker.previous,
            suggested: changes,
            filled,
            replaced,
          })
        );
      }
    }
  }

  const cursor = plans.find(planFilter, {
    projection: { userEmail: 1, majors: 1, minors: 1, createdAt: 1 },
    batchSize: BATCH_SIZE,
  });
  const batch: Plan[] = [];
  try {
    for await (const plan of cursor) {
      batch.push(plan);
      if (batch.length === BATCH_SIZE) {
        await processBatch(batch);
        batch.length = 0;
      }
    }
    await processBatch(batch);
  } finally {
    await cursor.close();
  }
  return summary;
}
