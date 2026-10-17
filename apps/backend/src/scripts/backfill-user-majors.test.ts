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

import { MIGRATION_ID, runDegreeBackfill } from "./backfill-user-majors-lib";

const uri = process.env.BACKFILL_TEST_MONGODB_URI;
const [majorA, majorB, majorC] = [...VALID_MAJORS];
const [minorA, minorB] = [...VALID_MINORS];
const cutoff = new Date("2026-09-30T00:00:00Z");
const createdAt = new Date("2025-01-01T00:00:00Z");
const marker = `_migrations.${MIGRATION_ID}`;

test(
  "GradTrak backfill preserves user choices across dry runs, races, and retries",
  {
    skip:
      !uri && "Set BACKFILL_TEST_MONGODB_URI to a disposable MongoDB instance",
  },
  async (t) => {
    const client = new MongoClient(uri!, { monitorCommands: true });
    await client.connect();
    const db = client.db(`backfill_test_${randomUUID().replaceAll("-", "")}`);
    const users = db.collection("users");
    const plans = db.collection("plans");
    try {
      await users.insertMany([
        { email: "legacy", majors: [majorA], minors: [minorA] },
        { email: "empty", majors: [], minors: [] },
        { email: "null", majors: null, minors: null },
        { email: "missing" },
        { email: "same", majors: [majorB, majorA], minors: [minorB] },
        { email: "no-plan", majors: [majorA] },
        { email: "empty-plan", majors: [majorA], minors: [minorA] },
        { email: "invalid", majors: [majorA] },
        { email: "malformed", majors: [majorA] },
        {
          email: "already",
          majors: [majorC],
          _migrations: { [MIGRATION_ID]: { confirmed: false } },
        },
        { email: "new-plan", majors: [majorA] },
      ]);
      await plans.insertMany([
        ...["legacy", "empty", "null", "missing", "no-user", "already"].map(
          (userEmail) => ({
            userEmail,
            majors: [majorB],
            minors: [minorB],
            createdAt,
          })
        ),
        {
          userEmail: "same",
          majors: [majorA, majorB],
          minors: [minorB],
          createdAt,
        },
        { userEmail: "empty-plan", majors: [], minors: [], createdAt },
        {
          userEmail: "invalid",
          majors: ["not-a-real-major"],
          minors: [],
          createdAt,
        },
        {
          userEmail: "malformed",
          majors: [majorA],
          minors: "bad-shape",
          createdAt,
        },
        {
          userEmail: "new-plan",
          majors: [majorB],
          minors: [],
          createdAt: new Date("2026-10-01T00:00:00Z"),
        },
      ]);

      const before = await users.find().sort({ _id: 1 }).toArray();
      const commands: string[] = [];
      const recordCommand = (event: { commandName: string }) =>
        commands.push(event.commandName);
      client.on("commandStarted", recordCommand);
      const dry = await runDegreeBackfill(db, { dryRun: true, cutoff });
      client.off("commandStarted", recordCommand);
      assert(
        commands.every((name) =>
          ["find", "aggregate", "getMore", "killCursors"].includes(name)
        ),
        commands.join(", ")
      );
      assert.deepEqual(await users.find().sort({ _id: 1 }).toArray(), before);
      assert.equal(await db.collection("migrationRuns").countDocuments(), 0);
      assert.equal(dry.plansScanned, 10);
      assert.equal(dry.usersWithChanges, 4);
      assert.equal(dry.usersRecordedUnchanged, 2);
      assert.equal(dry.majorFieldsReplaced, 1);
      assert.equal(dry.minorFieldsReplaced, 1);
      assert.equal(dry.majorFieldsFilled, 3);
      assert.equal(dry.minorFieldsFilled, 3);
      assert.equal(dry.skippedNoUser, 1);
      assert.equal(dry.skippedInvalidValue, 2);
      assert.equal(dry.skippedAlreadyMigrated, 1);

      const live = await runDegreeBackfill(db, { dryRun: false, cutoff });
      assert.deepEqual({ ...live, dryRun: true }, dry);
      const legacy = await users.findOne({ email: "legacy" });
      assert.deepEqual(legacy!.majors, [majorB]);
      assert.deepEqual(legacy!.minors, [minorB]);
      assert.deepEqual(legacy!._migrations[MIGRATION_ID].previous.majors, {
        present: true,
        value: [majorA],
      });
      assert.equal(legacy!._migrations[MIGRATION_ID].confirmed, false);
      assert.deepEqual(
        (await users.findOne({ email: "missing" }))!._migrations[MIGRATION_ID]
          .previous.majors,
        { present: false }
      );
      assert.deepEqual(
        (await users.findOne({ email: "null" }))!._migrations[MIGRATION_ID]
          .previous.majors,
        { present: true, value: null }
      );
      assert.deepEqual((await users.findOne({ email: "no-plan" }))!.majors, [
        majorA,
      ]);
      assert.deepEqual((await users.findOne({ email: "empty-plan" }))!.majors, [
        majorA,
      ]);
      assert.deepEqual((await users.findOne({ email: "same" }))!.majors, [
        majorB,
        majorA,
      ]);

      // Later account choices and plan edits must not be reset on a retry.
      await users.updateOne(
        { email: "legacy" },
        { $set: { majors: [majorC], minors: [] } }
      );
      await plans.updateOne(
        { userEmail: "empty-plan" },
        { $set: { majors: [majorB] } }
      );
      const retry = await runDegreeBackfill(db, { dryRun: false });
      assert.equal(retry.usersWithChanges, 0);
      assert.equal(retry.usersRecordedUnchanged, 0);
      assert.equal(retry.skippedAlreadyMigrated, 7);
      assert.equal(retry.cutoff, cutoff.toISOString());
      assert.deepEqual((await users.findOne({ email: "legacy" }))!.majors, [
        majorC,
      ]);
      assert.deepEqual((await users.findOne({ email: "legacy" }))!.minors, []);
      assert.deepEqual((await users.findOne({ email: "empty-plan" }))!.majors, [
        majorA,
      ]);
      assert.deepEqual((await users.findOne({ email: "new-plan" }))!.majors, [
        majorA,
      ]);
      assert.equal(
        (await users.findOne({ email: "new-plan" }))!._migrations,
        undefined
      );
      await assert.rejects(
        runDegreeBackfill(db, { dryRun: true, cutoff: new Date() }),
        /original migration cutoff/
      );

      // Force a real write between the read and conditional migration write.
      await users.insertOne({ email: "racing", majors: [majorA] });
      await plans.insertOne({
        userEmail: "racing",
        majors: [majorB],
        minors: [],
        createdAt,
      });
      const updateOne = Collection.prototype.updateOne;
      const mock = t.mock.method(
        Collection.prototype,
        "updateOne",
        async function (
          this: Collection,
          filter: Filter<Document>,
          update: UpdateFilter<Document>,
          options?: UpdateOptions
        ) {
          if (this.collectionName === "users" && filter[marker]) {
            await updateOne.call(
              this,
              { _id: filter._id },
              { $set: { majors: [majorC] } }
            );
          }
          return updateOne.call(this, filter, update, options);
        }
      );
      const raced = await runDegreeBackfill(db, { dryRun: false });
      mock.mock.restore();
      assert.equal(raced.skippedConcurrentChange, 1);
      assert.deepEqual((await users.findOne({ email: "racing" }))!.majors, [
        majorC,
      ]);
      assert.equal(
        (await users.findOne({ email: "racing" }))!._migrations[MIGRATION_ID]
          .status,
        "skipped-concurrent-change"
      );
      const retryAfterRace = await runDegreeBackfill(db, { dryRun: false });
      assert.equal(retryAfterRace.usersWithChanges, 0);
      assert.deepEqual((await users.findOne({ email: "racing" }))!.majors, [
        majorC,
      ]);

      await plans.insertOne({
        userEmail: "legacy",
        majors: [majorB],
        minors: [],
        createdAt,
      });
      await assert.rejects(
        runDegreeBackfill(db, { dryRun: true }),
        /duplicate plan.userEmail/
      );
    } finally {
      t.mock.restoreAll();
      await db.dropDatabase();
      await client.close();
    }
  }
);
