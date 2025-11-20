import { DateTime } from "luxon";

import {
  IEnrollmentSingularItem,
  NewEnrollmentHistoryModel,
  TermModel,
} from "@repo/common";

import { warmCatalogCacheForTerms } from "../lib/cache-warming";
import { GRANULARITY, getEnrollmentSingulars } from "../lib/enrollment";
import { Config } from "../shared/config";

// duration of time in seconds that can pass before being considered a data gap
const DATAGAP_THRESHOLD = 4 * GRANULARITY;

const TERMS_PER_API_BATCH = 4;

// enrollmentSingulars are equivalent if their data points are all equal
const enrollmentSingularsEqual = (
  a: IEnrollmentSingularItem["data"],
  b: IEnrollmentSingularItem["data"]
) => {
  const conditions = [
    a.status === b.status,
    a.enrolledCount === b.enrolledCount,
    a.reservedCount === b.reservedCount,
    a.waitlistedCount === b.waitlistedCount,
    a.minEnroll === b.minEnroll,
    a.maxEnroll === b.maxEnroll,
    a.maxWaitlist === b.maxWaitlist,
    a.openReserved === b.openReserved,
    a.instructorAddConsentRequired === b.instructorAddConsentRequired,
    a.instructorDropConsentRequired === b.instructorDropConsentRequired,
  ] as const;
  if (!conditions.every((condition) => condition)) {
    return false;
  }

  const aSeatReservationsEmpty =
    a.seatReservationCount == undefined || a.seatReservationCount.length == 0;
  const bSeatReservationsEmpty =
    b.seatReservationCount == undefined || b.seatReservationCount.length == 0;
  if (aSeatReservationsEmpty != bSeatReservationsEmpty) {
    return false;
  }

  if (a.seatReservationCount && b.seatReservationCount) {
    if (a.seatReservationCount.length !== b.seatReservationCount.length)
      return false;
    for (const aSeats of a.seatReservationCount) {
      const bSeats = b.seatReservationCount.find(
        (bSeats) => bSeats.number === aSeats.number
      );
      if (
        !bSeats ||
        aSeats.enrolledCount !== bSeats.enrolledCount ||
        aSeats.maxEnroll !== bSeats.maxEnroll
      ) {
        return false;
      }
    }
  }

  return true;
};

const updateEnrollmentHistories = async (config: Config) => {
  const {
    log,
    sis: { CLASS_APP_ID, CLASS_APP_KEY },
  } = config;

  log.trace(`Fetching terms...`);

  const now = DateTime.now();
  const nowPTDate = now.setZone("America/Los_Angeles").toISODate();

  const terms = await TermModel.find({
    academicCareerCode: "UGRD",
    temporalPosition: { $in: ["Current", "Future"] },
    $and: [
      { selfServiceEnrollBeginDate: { $lte: nowPTDate } },
      { selfServiceEnrollEndDate: { $gte: nowPTDate } },
    ],
  }).lean();

  log.info(
    `Fetched ${terms.length.toLocaleString()} terms: ${terms.map((term) => term.name).toLocaleString()}.`
  );
  if (terms.length == 0) {
    log.warn(`No terms found, skipping update.`);
    return;
  }

  let totalEnrollmentSingulars = 0;
  let totalInserted = 0;
  let totalUpdated = 0;

  for (let i = 0; i < terms.length; i += TERMS_PER_API_BATCH) {
    const termsBatch = terms.slice(i, i + TERMS_PER_API_BATCH);
    const termsBatchIds = termsBatch.map((term) => term.id);

    log.trace(
      `Fetching enrollments for term ${termsBatch.map((term) => term.name).toLocaleString()}...`
    );

    const enrollmentSingulars = await getEnrollmentSingulars(
      log,
      CLASS_APP_ID,
      CLASS_APP_KEY,
      termsBatchIds
    );

    log.info(
      `Fetched ${enrollmentSingulars.length.toLocaleString()} enrollments.`
    );
    if (!enrollmentSingulars) {
      log.warn(`No enrollments found, skipping update.`);
      return;
    }
    totalEnrollmentSingulars += enrollmentSingulars.length;

    const PROCESSING_BATCH_SIZE = 500;

    // Process enrollments in batches to avoid massive queries
    for (
      let batchStart = 0;
      batchStart < enrollmentSingulars.length;
      batchStart += PROCESSING_BATCH_SIZE
    ) {
      const enrollmentBatch = enrollmentSingulars.slice(
        batchStart,
        batchStart + PROCESSING_BATCH_SIZE
      );

      // Build list of identifiers for this batch
      const identifiers = enrollmentBatch.map((es) => ({
        termId: es.termId,
        sessionId: es.sessionId,
        sectionId: es.sectionId,
      }));

      // Pre-fetch existing documents for this batch only
      const existingDocs = await NewEnrollmentHistoryModel.find({
        $or: identifiers,
      }).lean();

      // Build a map for O(1) lookups: "termId:sessionId:sectionId" -> doc
      const existingDocsMap = new Map(
        existingDocs.map((doc) => [
          `${doc.termId}:${doc.sessionId}:${doc.sectionId}`,
          doc,
        ])
      );

      // Build bulk write operations for this batch
      const bulkOps: any[] = [];

      for (const enrollmentSingular of enrollmentBatch) {
        const identifier = {
          termId: enrollmentSingular.termId,
          sessionId: enrollmentSingular.sessionId,
          sectionId: enrollmentSingular.sectionId,
        };
        const docKey = `${identifier.termId}:${identifier.sessionId}:${identifier.sectionId}`;
        const existingDoc = existingDocsMap.get(docKey);

        if (!existingDoc) {
          const { data, ...rest } = enrollmentSingular;
          bulkOps.push({
            insertOne: {
              document: { ...rest, history: [data] },
            },
          });
          totalInserted += 1;
        } else {
          if (existingDoc.history.length === 0) {
            bulkOps.push({
              updateOne: {
                filter: { _id: existingDoc._id },
                update: {
                  $push: { history: enrollmentSingular.data },
                },
              },
            });
            totalUpdated += 1;
          } else {
            /*
              If all of the following are true:
                 1. Latest enrollment entry matches incoming enrollment data using `enrollmentSingularsEqual`
                 2. Latest enrollment entry's granularity matches incoming granularity
                 3. Latest enrollment entry's endTime is less than DATAGAP_THRESHOLD ago

              Then: Extend the last entry's endTime using $set.

              Else: Append a new entry with incoming startTime and endTime using $push.
            */
            const lastEntry =
              existingDoc.history[existingDoc.history.length - 1];
            const lastIndex = existingDoc.history.length - 1;

            // true if enrollment singular data is equal to latest entry
            const dataMatches = enrollmentSingularsEqual(
              lastEntry,
              enrollmentSingular.data
            );

            // true if latest entry has same granularity as incoming singular
            const granularityMatches =
              lastEntry.granularitySeconds ===
              enrollmentSingular.data.granularitySeconds;

            // true if duration from last entry's end time to current time is less than DATAGAP_THRESHOLD
            const incomingEndTime = DateTime.fromJSDate(
              enrollmentSingular.data.endTime
            );
            const lastEntryEndTime = DateTime.fromJSDate(lastEntry.endTime);
            const withinDatagapThreshold =
              incomingEndTime.diff(lastEntryEndTime, "seconds").seconds <=
              DATAGAP_THRESHOLD;

            if (dataMatches && granularityMatches && withinDatagapThreshold) {
              // Extend the endTime of the last entry using update
              bulkOps.push({
                updateOne: {
                  filter: { _id: existingDoc._id },
                  update: {
                    $set: { [`history.${lastIndex}.endTime`]: now.toJSDate() },
                  },
                },
              });
            } else {
              // Append a new entry
              bulkOps.push({
                updateOne: {
                  filter: { _id: existingDoc._id },
                  update: {
                    $push: { history: enrollmentSingular.data },
                  },
                },
              });
            }
            totalUpdated += 1;
          }
        }

        /*
          Start Migration 11/18/2025: Fix missing seatReservationTypes
        */
        if (
          existingDoc &&
          (existingDoc.seatReservationTypes === undefined ||
            existingDoc.seatReservationTypes === null ||
            existingDoc.seatReservationTypes.length === 0) &&
          enrollmentSingular.seatReservationTypes !== undefined &&
          enrollmentSingular.seatReservationTypes !== null &&
          enrollmentSingular.seatReservationTypes.length !== 0
        ) {
          bulkOps.push({
            updateOne: {
              filter: { _id: existingDoc._id },
              update: {
                $set: {
                  seatReservationTypes: enrollmentSingular.seatReservationTypes,
                },
              },
            },
          });
        }
        /*
          End Migration 11/18/2025
        */
      }

      // Execute bulk operations for this batch
      if (bulkOps.length > 0) {
        await NewEnrollmentHistoryModel.bulkWrite(bulkOps, {
          ordered: false,
        });
      }
    }
  }

  log.info(
    `Completed updating database with ${totalEnrollmentSingulars.toLocaleString()} enrollments: ${totalInserted.toLocaleString()} inserted, ${totalUpdated.toLocaleString()} updated.`
  );

  // Warm catalog cache for all terms we just updated
  await warmCatalogCacheForTerms(config, terms);
};

export default { updateEnrollmentHistories };
