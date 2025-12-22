/**
 * Migration script: Populate classId and courseId fields on Rating and AggregatedMetrics documents.
 *
 * This script migrates existing ratings to use the new courseId-based schema for
 * cross-listed course aggregation.
 *
 * Prerequisites:
 *   - MongoDB connection configured via MONGODB_URI environment variable
 *   - All Class documents must already exist with courseId populated
 *
 * Usage:
 *   cd apps/backend
 *   npx tsx scripts/migrate-ratings-to-classid.ts
 *
 * The script will:
 *   1. Find all Rating documents without classId
 *   2. Look up the Class document by subject/courseNumber/semester/year/classNumber
 *   3. Populate classId and courseId from the Class document
 *   4. Do the same for AggregatedMetrics documents
 */
import * as dotenv from "dotenv";
import mongoose from "mongoose";

// Import models after dotenv config
import { AggregatedMetricsModel, ClassModel, RatingModel } from "@repo/common";

// Load env before importing models
dotenv.config();

const BATCH_SIZE = 100;

interface ClassLookupCache {
  [key: string]: { classId: mongoose.Types.ObjectId; courseId: string } | null;
}

const classCache: ClassLookupCache = {};

async function lookupClass(
  subject: string,
  courseNumber: string,
  semester: string,
  year: number,
  classNumber: string
): Promise<{ classId: mongoose.Types.ObjectId; courseId: string } | null> {
  const cacheKey = `${subject}_${courseNumber}_${semester}_${year}_${classNumber}`;

  if (cacheKey in classCache) {
    return classCache[cacheKey];
  }

  const classDoc = await ClassModel.findOne({
    subject,
    courseNumber,
    semester,
    year,
    number: classNumber,
  }).select("_id courseId");

  if (!classDoc || !classDoc.courseId) {
    classCache[cacheKey] = null;
    return null;
  }

  const result = {
    classId: classDoc._id as mongoose.Types.ObjectId,
    courseId: classDoc.courseId,
  };
  classCache[cacheKey] = result;
  return result;
}

async function migrateRatings(): Promise<{ migrated: number; failed: number }> {
  console.log("Migrating Rating documents...");

  let migrated = 0;
  let failed = 0;
  let cursor = RatingModel.find({
    $or: [{ classId: { $exists: false } }, { courseId: { $exists: false } }],
  }).cursor();

  let batch: any[] = [];

  for await (const rating of cursor) {
    const classInfo = await lookupClass(
      rating.subject,
      rating.courseNumber,
      rating.semester,
      rating.year,
      rating.classNumber
    );

    if (!classInfo) {
      console.warn(
        `  Warning: No class found for rating ${rating._id} (${rating.subject} ${rating.courseNumber} ${rating.semester} ${rating.year} #${rating.classNumber})`
      );
      failed++;
      continue;
    }

    batch.push({
      updateOne: {
        filter: { _id: rating._id },
        update: {
          $set: {
            classId: classInfo.classId,
            courseId: classInfo.courseId,
          },
        },
      },
    });

    if (batch.length >= BATCH_SIZE) {
      await RatingModel.bulkWrite(batch);
      migrated += batch.length;
      console.log(`  Migrated ${migrated} ratings...`);
      batch = [];
    }
  }

  // Process remaining batch
  if (batch.length > 0) {
    await RatingModel.bulkWrite(batch);
    migrated += batch.length;
  }

  console.log(`  Completed: ${migrated} migrated, ${failed} failed`);
  return { migrated, failed };
}

async function migrateAggregatedMetrics(): Promise<{
  migrated: number;
  failed: number;
}> {
  console.log("Migrating AggregatedMetrics documents...");

  let migrated = 0;
  let failed = 0;
  let cursor = AggregatedMetricsModel.find({
    $or: [{ classId: { $exists: false } }, { courseId: { $exists: false } }],
  }).cursor();

  let batch: any[] = [];

  for await (const metric of cursor) {
    const classInfo = await lookupClass(
      metric.subject,
      metric.courseNumber,
      metric.semester,
      metric.year,
      metric.classNumber
    );

    if (!classInfo) {
      console.warn(
        `  Warning: No class found for metric ${metric._id} (${metric.subject} ${metric.courseNumber} ${metric.semester} ${metric.year} #${metric.classNumber})`
      );
      failed++;
      continue;
    }

    batch.push({
      updateOne: {
        filter: { _id: metric._id },
        update: {
          $set: {
            classId: classInfo.classId,
            courseId: classInfo.courseId,
          },
        },
      },
    });

    if (batch.length >= BATCH_SIZE) {
      await AggregatedMetricsModel.bulkWrite(batch);
      migrated += batch.length;
      console.log(`  Migrated ${migrated} aggregated metrics...`);
      batch = [];
    }
  }

  // Process remaining batch
  if (batch.length > 0) {
    await AggregatedMetricsModel.bulkWrite(batch);
    migrated += batch.length;
  }

  console.log(`  Completed: ${migrated} migrated, ${failed} failed`);
  return { migrated, failed };
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("Error: MONGODB_URI environment variable is required");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("Connected.");

  try {
    // Count documents before migration
    const ratingCount = await RatingModel.countDocuments({
      $or: [{ classId: { $exists: false } }, { courseId: { $exists: false } }],
    });
    const metricCount = await AggregatedMetricsModel.countDocuments({
      $or: [{ classId: { $exists: false } }, { courseId: { $exists: false } }],
    });

    console.log(`\nDocuments to migrate:`);
    console.log(`  Ratings: ${ratingCount}`);
    console.log(`  AggregatedMetrics: ${metricCount}`);
    console.log("");

    if (ratingCount === 0 && metricCount === 0) {
      console.log("No documents need migration. Exiting.");
      return;
    }

    const ratingResult = await migrateRatings();
    const metricResult = await migrateAggregatedMetrics();

    console.log("\n=== Migration Summary ===");
    console.log(
      `Ratings: ${ratingResult.migrated} migrated, ${ratingResult.failed} failed`
    );
    console.log(
      `AggregatedMetrics: ${metricResult.migrated} migrated, ${metricResult.failed} failed`
    );

    if (ratingResult.failed > 0 || metricResult.failed > 0) {
      console.log(
        "\nWarning: Some documents could not be migrated. Check the logs above for details."
      );
      console.log(
        "These are likely orphaned ratings for classes that no longer exist in the database."
      );
    }
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
  }
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
