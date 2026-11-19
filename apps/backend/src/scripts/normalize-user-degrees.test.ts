import {
  Collection,
  Document,
  Filter,
  MongoClient,
  UpdateFilter,
  UpdateOptions,
} from "mongodb";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";

import { VALID_MAJORS, VALID_MINORS } from "@repo/common/lib/degreePrograms";

import { MIGRATION_ID } from "./backfill-user-majors-lib";
import {
  CLEANUP_ID,
  LEGACY_DEGREE_ALIASES,
  normalizeDegrees,
  runProfileDegreeMigration,
} from "./normalize-user-degrees";

const uri = process.env.BACKFILL_TEST_MONGODB_URI;
const eecs = "Electrical Engineering & Computer Sciences (EECS)";
const cutoff = new Date("2026-10-14T00:00:00Z");
const createdAt = new Date("2025-01-01T00:00:00Z");

test("legacy aliases preserve valid majors without guessing programs or moving minors", () => {
  assert(
    [...LEGACY_DEGREE_ALIASES.values()].every((value) =>
      VALID_MAJORS.has(value)
    )
  );
  const result = normalizeDegrees(
    [
      "Computer Science",
      "EECS",
      eecs,
      "Film",
      "Nutritional Sciences",
      "Public Policy",
    ],
    "majors"
  );
  assert.deepEqual(result.values, ["Computer Science", eecs, "Film & Media"]);
  assert.deepEqual(result.removed, [
    { value: "Nutritional Sciences", reason: "no-confident-canonical-match" },
    { value: "Public Policy", reason: "valid-only-in-other-field" },
  ]);
  assert.deepEqual(
    normalizeDegrees(["EECS", "Film", "Public Policy"], "minors").values,
    [eecs, "Public Policy"]
  );
  assert.deepEqual(normalizeDegrees("EECS", "majors").values, []);
  assert.equal(normalizeDegrees(null, "minors").changed, false);
  assert.deepEqual(
    normalizeDegrees(
      ["Operations Research & Management Science", "Biology + Business"],
      "majors"
    ).values,
    []
  );
});

test(
  "combined migration cleans no-plan users, archives originals, and respects GradTrak and retries",
  {
    skip:
      !uri && "Set BACKFILL_TEST_MONGODB_URI to a disposable MongoDB instance",
  },
  async (t) => {
    const client = new MongoClient(uri!, { monitorCommands: true });
    await client.connect();
    const db = client.db(
      `degree_cleanup_test_${randomUUID().replaceAll("-", "")}`
    );
    const users = db.collection("users");
    const plans = db.collection("plans");
    try {
      await users.insertMany([
        { email: "alias", majors: ["EECS"], minors: [] },
        {
          email: "mixed",
          majors: [
            "Computer Science",
            "Film",
            "Nutritional Sciences",
            "Public Policy",
          ],
          minors: ["EECS", "Public Policy"],
        },
        { email: "ambiguous", majors: ["Biology + Business"] },
        { email: "gradtrak", majors: ["EECS"], minors: [] },
        { email: "empty-plan", majors: ["IEOR"], minors: [] },
        { email: "invalid-plan", majors: ["Film"] },
        { email: "canonical", majors: ["Computer Science"] },
        { email: "empty", majors: [], minors: [] },
        { email: "null", majors: null, minors: null },
        { email: "malformed", majors: "EECS", minors: [42] },
      ]);
      await plans.insertMany([
        {
          userEmail: "gradtrak",
          majors: ["Data Science"],
          minors: ["Public Policy"],
          createdAt,
        },
        { userEmail: "empty-plan", majors: [], minors: [], createdAt },
        {
          userEmail: "invalid-plan",
          majors: ["not-a-major"],
          minors: [],
          createdAt,
        },
      ]);
      const before = await users.find().sort({ _id: 1 }).toArray();
      const commands: string[] = [];
      const listener = ({ commandName }: { commandName: string }) =>
        commands.push(commandName);
      client.on("commandStarted", listener);
      const dry = await runProfileDegreeMigration(db, { dryRun: true, cutoff });
      client.off("commandStarted", listener);
      assert(
        commands.every((name) =>
          ["find", "aggregate", "getMore", "killCursors"].includes(name)
        ),
        commands.join(", ")
      );
      assert.deepEqual(await users.find().sort({ _id: 1 }).toArray(), before);
      assert.equal(await db.collection("migrationRuns").countDocuments(), 0);
      assert.equal(dry.gradTrak.usersWithChanges, 1);
      assert.equal(dry.legacyCleanup.usersWithChanges, 6);
      assert.equal(dry.legacyCleanup.majorEntriesMapped, 4); // GradTrak's overwritten EECS isn't counted.
      assert.equal(dry.legacyCleanup.usersLeftWithoutMajor, 2);
      assert.equal(dry.legacyCleanup.remainingInvalidUsers, 0);
      const live = await runProfileDegreeMigration(db, {
        dryRun: false,
        cutoff,
      });
      assert.deepEqual(
        { ...live, dryRun: true, gradTrak: { ...live.gradTrak, dryRun: true } },
        dry
      );
      assert.deepEqual((await users.findOne({ email: "alias" }))!.majors, [
        eecs,
      ]);
      const mixed = (await users.findOne({ email: "mixed" }))!;
      assert.deepEqual(mixed.majors, ["Computer Science", "Film & Media"]);
      assert.deepEqual(mixed.minors, [eecs, "Public Policy"]);
      assert.deepEqual(mixed._migrations[CLEANUP_ID].previous.majors.value, [
        "Computer Science",
        "Film",
        "Nutritional Sciences",
        "Public Policy",
      ]);
      assert.equal(mixed._migrations[CLEANUP_ID].confirmed, false);
      assert.deepEqual(
        (await users.findOne({ email: "ambiguous" }))!.majors,
        []
      );
      assert.deepEqual(
        (await users.findOne({ email: "ambiguous" }))!._migrations[CLEANUP_ID]
          .previous.minors,
        { present: false }
      );
      const gradtrak = (await users.findOne({ email: "gradtrak" }))!;
      assert.deepEqual(gradtrak.majors, ["Data Science"]);
      assert.deepEqual(
        gradtrak._migrations[MIGRATION_ID].previous.majors.value,
        ["EECS"]
      );
      assert.equal(gradtrak._migrations[CLEANUP_ID], undefined);
      assert.deepEqual((await users.findOne({ email: "empty-plan" }))!.majors, [
        "Industrial Engineering & Operations Research",
      ]);
      const cleaned = await users.find().toArray();
      for (const user of cleaned) {
        assert(
          user.majors == null ||
            user.majors.every((v: string) => VALID_MAJORS.has(v))
        );
        assert(
          user.minors == null ||
            user.minors.every((v: string) => VALID_MINORS.has(v))
        );
      }
      await users.updateOne(
        { email: "alias" },
        { $set: { majors: ["Mathematics"] } }
      );
      await plans.updateOne(
        { userEmail: "gradtrak" },
        { $set: { majors: ["Statistics"] } }
      );
      const retry = await runProfileDegreeMigration(db, { dryRun: false });
      assert.equal(retry.legacyCleanup.usersWithChanges, 0);
      assert.equal(retry.legacyCleanup.remainingInvalidUsers, 0);
      assert.deepEqual((await users.findOne({ email: "alias" }))!.majors, [
        "Mathematics",
      ]);
      assert.deepEqual((await users.findOne({ email: "gradtrak" }))!.majors, [
        "Data Science",
      ]);

      // A concurrent choice is protected during cleanup and on a later retry.
      await users.insertOne({ email: "race", majors: ["EECS"] });
      const originalUpdate = Collection.prototype.updateOne;
      const mock = t.mock.method(
        Collection.prototype,
        "updateOne",
        async function (
          this: Collection,
          filter: Filter<Document>,
          update: UpdateFilter<Document>,
          options?: UpdateOptions
        ) {
          if (
            this.collectionName === "users" &&
            filter.$and &&
            filter[`_migrations.${CLEANUP_ID}`]
          ) {
            await originalUpdate.call(
              this,
              { _id: filter._id },
              { $set: { majors: ["Mathematics"] } }
            );
          }
          return originalUpdate.call(this, filter, update, options);
        }
      );
      const raced = await runProfileDegreeMigration(db, { dryRun: false });
      mock.mock.restore();
      assert.equal(raced.legacyCleanup.skippedConcurrentChange, 1);
      assert.equal(raced.legacyCleanup.remainingInvalidUsers, 0);
      assert.deepEqual((await users.findOne({ email: "race" }))!.majors, [
        "Mathematics",
      ]);
      assert.equal(
        (await users.findOne({ email: "race" }))!._migrations[CLEANUP_ID]
          .status,
        "skipped-concurrent-change"
      );
      assert.equal(
        (await runProfileDegreeMigration(db, { dryRun: false })).legacyCleanup
          .usersWithChanges,
        0
      );

      // Existing completion/conflict records also protect uncanonical later values;
      // verification reports them instead of silently claiming a clean result.
      await users.updateOne({ email: "alias" }, { $set: { majors: ["EECS"] } });
      await users.insertOne({
        email: "gradtrak-conflict",
        majors: ["IEOR"],
        _migrations: {
          [MIGRATION_ID]: { status: "skipped-concurrent-change" },
        },
      });
      const guarded = await runProfileDegreeMigration(db, { dryRun: true });
      assert.equal(guarded.legacyCleanup.skippedAlreadyCleaned, 1);
      assert.equal(guarded.legacyCleanup.skippedGradTrakConflict, 1);
      assert.equal(guarded.legacyCleanup.remainingInvalidUsers, 2);
    } finally {
      t.mock.restoreAll();
      await db.dropDatabase();
      await client.close();
    }
  }
);
