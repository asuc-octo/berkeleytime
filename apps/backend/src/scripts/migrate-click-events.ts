/**
 * One-time migration script: copies historical ClickEvent documents into the
 * new TrackingEvent collection. Safe to re-run — uses insertMany with
 * ordered: false and ignores duplicate key errors.
 *
 * Usage:
 *   npx ts-node -e "require('./src/scripts/migrate-click-events')"
 *   OR run via the npm script: npm run migrate:click-events
 */
import mongoose from "mongoose";

import { ClickEventModel } from "@repo/common/models";
import { TrackingEventModel } from "@repo/common/models";

const BATCH_SIZE = 500;

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI env var is required");
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const total = await ClickEventModel.countDocuments();
  console.log(`Found ${total} ClickEvent documents to migrate`);

  let migrated = 0;
  let skipped = 0;
  const cursor = ClickEventModel.find().lean().cursor();

  const batch: object[] = [];

  const flush = async () => {
    if (batch.length === 0) return;
    try {
      await TrackingEventModel.insertMany(batch, { ordered: false });
    } catch (err: unknown) {
      // E11000 = duplicate key — already migrated, safe to ignore
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: number }).code !== 11000
      ) {
        throw err;
      }
      skipped += (err as { result?: { nInserted?: number } })?.result?.nInserted
        ? 0
        : batch.length;
    }
    migrated += batch.length;
    batch.length = 0;
    process.stdout.write(`\r  Migrated ${migrated}/${total}...`);
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
