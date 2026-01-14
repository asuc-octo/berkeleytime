import { AggregatedMetricsModel, ClassModel } from "@repo/common";

import { Config } from "../shared/config";

const BATCH_SIZE = 1000;

/**
 * Migration: Backfill classId and courseId on aggregatedmetrics collection.
 *
 * This migration is non-destructive - it only adds missing fields without
 * dropping any data or indexes. After running this migration successfully,
 * you can manually:
 * 1. Drop the old index: db.aggregatedmetrics.dropIndex("subject_1_courseNumber_1_semester_1_year_1_classNumber_1_metricName_1_categoryValue_1")
 * 2. Create the new index: db.aggregatedmetrics.createIndex({ classId: 1, metricName: 1, categoryValue: 1 }, { unique: true })
 */
const backfillAggregatedMetricsClassId = async (config: Config) => {
  const log = config.log.getSubLogger({ name: "BackfillClassId" });

  log.info("Starting backfill of classId/courseId on aggregatedmetrics...");

  // Count documents needing backfill
  const totalToBackfill = await AggregatedMetricsModel.countDocuments({
    classId: null,
  });

  if (totalToBackfill === 0) {
    log.info(
      "No documents need backfilling. All documents already have classId."
    );
    return;
  }

  log.info(
    `Found ${totalToBackfill.toLocaleString()} documents with null classId.`
  );

  // Build a cache of all classes for efficient lookup
  log.trace("Building class lookup cache...");
  const allClasses = await ClassModel.find({})
    .select({
      _id: 1,
      courseId: 1,
      subject: 1,
      courseNumber: 1,
      semester: 1,
      year: 1,
      number: 1,
    })
    .lean();

  // Create lookup map: "subject|courseNumber|semester|year|classNumber" -> { _id, courseId }
  const classLookup = new Map<string, { _id: unknown; courseId: string }>();
  for (const cls of allClasses) {
    const key = `${cls.subject}|${cls.courseNumber}|${cls.semester}|${cls.year}|${cls.number}`;
    classLookup.set(key, { _id: cls._id, courseId: cls.courseId });
  }

  log.info(
    `Built lookup cache with ${classLookup.size.toLocaleString()} classes.`
  );

  let processed = 0;
  let updated = 0;
  let notFound = 0;

  // Process in batches using cursor
  const cursor = AggregatedMetricsModel.find({ classId: null })
    .select({
      _id: 1,
      subject: 1,
      courseNumber: 1,
      semester: 1,
      year: 1,
      classNumber: 1,
    })
    .lean()
    .cursor();

  const bulkOps: {
    updateOne: {
      filter: { _id: unknown };
      update: { $set: { classId: unknown; courseId: string } };
    };
  }[] = [];

  const orphanedDocs: {
    subject: string;
    courseNumber: string;
    semester: string;
    year: number;
    classNumber: string;
  }[] = [];

  for await (const doc of cursor) {
    processed++;

    const key = `${doc.subject}|${doc.courseNumber}|${doc.semester}|${doc.year}|${doc.classNumber}`;
    const classInfo = classLookup.get(key);

    if (classInfo) {
      bulkOps.push({
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: { classId: classInfo._id, courseId: classInfo.courseId },
          },
        },
      });
    } else {
      notFound++;
      // Track unique orphaned class combinations
      const orphanKey = key;
      if (
        !orphanedDocs.some(
          (d) =>
            `${d.subject}|${d.courseNumber}|${d.semester}|${d.year}|${d.classNumber}` ===
            orphanKey
        )
      ) {
        orphanedDocs.push({
          subject: doc.subject,
          courseNumber: doc.courseNumber,
          semester: doc.semester,
          year: doc.year,
          classNumber: doc.classNumber,
        });
      }
    }

    // Execute bulk operations in batches
    if (bulkOps.length >= BATCH_SIZE) {
      const result = await AggregatedMetricsModel.bulkWrite(bulkOps);
      updated += result.modifiedCount;
      bulkOps.length = 0;

      if (processed % 5000 === 0) {
        log.trace(
          `Progress: ${processed.toLocaleString()} / ${totalToBackfill.toLocaleString()} ` +
            `(${((processed / totalToBackfill) * 100).toFixed(1)}%) - ` +
            `Updated: ${updated.toLocaleString()}, Not found: ${notFound.toLocaleString()}`
        );
      }
    }
  }

  // Execute remaining bulk operations
  if (bulkOps.length > 0) {
    const result = await AggregatedMetricsModel.bulkWrite(bulkOps);
    updated += result.modifiedCount;
  }

  log.info("Backfill complete!");
  log.info(`  Total processed: ${processed.toLocaleString()}`);
  log.info(`  Successfully updated: ${updated.toLocaleString()}`);
  log.info(`  No matching class found: ${notFound.toLocaleString()}`);

  if (orphanedDocs.length > 0) {
    log.warn(
      `Found ${orphanedDocs.length} unique class combinations with no matching class document:`
    );
    // Log first 10 orphaned classes
    for (const doc of orphanedDocs.slice(0, 10)) {
      log.warn(
        `  - ${doc.subject} ${doc.courseNumber} ${doc.semester} ${doc.year} #${doc.classNumber}`
      );
    }
    if (orphanedDocs.length > 10) {
      log.warn(`  ... and ${orphanedDocs.length - 10} more`);
    }
    log.warn(
      "These orphaned documents were NOT updated. You may want to investigate " +
        "whether these classes exist or if the aggregated metrics should be deleted."
    );
  }

  // Verify results
  const remainingNull = await AggregatedMetricsModel.countDocuments({
    classId: null,
  });
  if (remainingNull === 0) {
    log.info(
      "All documents now have classId. Safe to proceed with index migration."
    );
    log.info("Next steps:");
    log.info(
      "  1. Drop old index: db.aggregatedmetrics.dropIndex('subject_1_courseNumber_1_semester_1_year_1_classNumber_1_metricName_1_categoryValue_1')"
    );
    log.info(
      "  2. Create new index: db.aggregatedmetrics.createIndex({ classId: 1, metricName: 1, categoryValue: 1 }, { unique: true })"
    );
  } else {
    log.warn(
      `${remainingNull.toLocaleString()} documents still have null classId. ` +
        "Investigate orphaned documents before proceeding with index migration."
    );
  }
};

export default {
  backfillAggregatedMetricsClassId,
};
