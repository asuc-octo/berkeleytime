/**
 * One-time migration script: copies historical ClickEvent documents into the
 * new TrackingEvent collection. Safe to re-run — uses insertMany with
 * ordered: false and ignores duplicate key errors.
 *
 * Usage:
 *   npx tsx src/scripts/migrate-click-events.ts
 *   OR run via the npm script: npm run migrate:click-events
 *
 * Set MIGRATE_BEFORE to an ISO timestamp to migrate only ClickEvents older than
 * it. Required when running after the unified-tracking deploy is live, since the
 * new write path also populates TrackingEvent — without a cutoff, clicks in the
 * overlap window are counted twice.
 */
import mongoose from "mongoose";

import { ClickEventModel } from "@repo/common/models";
import { TrackingEventModel } from "@repo/common/models";

const BATCH_SIZE = 500;

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI env var is required");

  const before = process.env.MIGRATE_BEFORE;
  if (before && Number.isNaN(new Date(before).getTime())) {
    throw new Error(`MIGRATE_BEFORE is not a valid date: ${before}`);
  }
  const filter = before ? { timestamp: { $lt: new Date(before) } } : {};

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  if (before) {
    console.log(
      `Cutoff: only migrating events before ${new Date(before).toISOString()}`
    );
  } else {
    console.log("No MIGRATE_BEFORE set — migrating the entire collection");
  }

  const total = await ClickEventModel.countDocuments(filter);
  console.log(`Found ${total} ClickEvent documents to migrate`);

  let migrated = 0;
  let skipped = 0;
  const cursor = ClickEventModel.find(filter).lean().cursor();

  const batch: object[] = [];

  const flush = async () => {
    if (batch.length === 0) return;
    try {
      await TrackingEventModel.insertMany(batch, { ordered: false });
      migrated += batch.length;
    } catch (err: unknown) {
      // E11000 = duplicate key — already migrated, safe to ignore. Anything
      // else (connection drop, timeout, validation) must not be swallowed.
      const writeErrors =
        (err as { writeErrors?: { err?: { code?: number }; code?: number }[] })
          ?.writeErrors ?? [];
      const isDuplicate = (e: { err?: { code?: number }; code?: number }) =>
        (e.err?.code ?? e.code) === 11000;

      if (writeErrors.length === 0 || !writeErrors.every(isDuplicate)) {
        throw err;
      }

      migrated += batch.length - writeErrors.length;
      skipped += writeErrors.length;
    }
    batch.length = 0;
    process.stdout.write(
      `\r  Migrated ${migrated}, skipped ${skipped} (of ${total})...`
    );
  };

  for await (const doc of cursor) {
    batch.push({
      // Preserve original _id so re-runs hit the unique index and skip duplicates
      _id: doc._id,
      // Map old ClickEvent fields → TrackingEvent fields
      eventType: "click",
      targetType: doc.targetType, // "banner" | "redirect" | "targeted-message"
      targetId: doc.targetId.toString(),
      metadata: {
        ...(doc.targetVersion !== undefined && { version: doc.targetVersion }),
        ...(doc.additionalInfo && { additionalInfo: doc.additionalInfo }),
      },
      // Use sessionFingerprint as a stand-in for sessionId (best available)
      sessionId: doc.sessionFingerprint,
      userId: doc.userId,
      timestamp: doc.timestamp,
      ipHash: doc.ipHash,
      userAgent: doc.userAgent,
      referrer: doc.referrer,
    });

    if (batch.length >= BATCH_SIZE) {
      await flush();
    }
  }

  await flush();

  console.log(
    `\nDone. Migrated ${migrated} events, skipped ${skipped} duplicates.`
  );
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
