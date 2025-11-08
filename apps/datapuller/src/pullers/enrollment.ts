import { DateTime } from "luxon";

import {
  IEnrollmentSingularItem,
  NewEnrollmentHistoryModel,
  TermModel,
} from "@repo/common";

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

const updateEnrollmentHistories = async ({
  log,
  sis: { CLASS_APP_ID, CLASS_APP_KEY },
  backend: { url: BACKEND_URL },
}: Config) => {
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

    for (const enrollmentSingular of enrollmentSingulars) {
      const session = await NewEnrollmentHistoryModel.startSession();

      await session.withTransaction(async () => {
        const identifier = {
          termId: enrollmentSingular.termId,
          sessionId: enrollmentSingular.sessionId,
          sectionId: enrollmentSingular.sectionId,
        };

        // find existing history
        const doc = await NewEnrollmentHistoryModel.findOne(identifier, null, {
          session,
        });

        if (!doc) {
          const { data, ...rest } = enrollmentSingular;
          await NewEnrollmentHistoryModel.create(
            [{ ...rest, history: [data] }],
            { session }
          );
          totalUpdated += 1;
        } else {
          if (doc.history.length == 0) {
            doc.history.push(enrollmentSingular.data);
          } else {
            /*
              If all of the following are true:
                 1. Latest enrollment entry matches incoming enrollment data using `enrollmentSingularsEqual`
                 2. Latest enrollment entry's granularity matches incoming granularity
                 3. Latest enrollment entry's endTime is less than DATAGAP_THRESHOLD ago

              Then: Modify lastEntry with an extended endTime.

              Else: Append a new entry with incoming startTime and endTime.
            */
            const lastEntry = doc.history[doc.history.length - 1];

            // true if enrollment singular data is equal to latest entry
            const dataMatches = enrollmentSingularsEqual(
              lastEntry,
              enrollmentSingular.data
            );

            // true if latest entry has same granularity as incoming singular
            const granularityMatches =
              lastEntry.granularitySeconds ===
              enrollmentSingular.data.granularitySeconds;

            // true if duration from last entry's end time to current time exceeds DATAGAP_THRESHOLD
            const incomingEndTime = DateTime.fromJSDate(
              enrollmentSingular.data.endTime
            );
            const lastEntryEndTime = DateTime.fromJSDate(lastEntry.endTime);
            const withinDatagapThreshold =
              incomingEndTime.diff(lastEntryEndTime, "seconds").seconds <=
              DATAGAP_THRESHOLD;

            if (dataMatches && granularityMatches && withinDatagapThreshold) {
              lastEntry.endTime = now.toJSDate();
            } else {
              doc.history.push(enrollmentSingular.data);
            }
          }
          await doc.save({ session });
          totalUpdated += 1;
        }
      });

      session.endSession();
    }
  }

  log.info(
    `Completed updating database with ${totalEnrollmentSingulars.toLocaleString()} enrollments, updated ${totalUpdated.toLocaleString()} documents.`
  );

  // Warm catalog cache for all terms we just updated
  log.info("Warming catalog cache for updated terms...");
  for (const term of terms) {
    const [yearStr, semester] = term.name.split(" ");
    const year = parseInt(yearStr);

    if (!year || !semester) {
      log.warn(`Failed to parse term name: ${term.name}`);
      continue;
    }

    try {
      log.trace(`Warming cache for ${term.name}...`);

      // Try configured URL, fallback to common Docker service names
      const urlsToTry = [
        BACKEND_URL,
        ...(BACKEND_URL.includes("localhost")
          ? ["http://backend:5001/api", "http://bt-backend:5001/api"]
          : []),
      ];

      let response: Response | null = null;
      let lastError: Error | null = null;

      for (const url of urlsToTry) {
        try {
          response = await fetch(`${url}/cache/warm-catalog`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ year, semester }),
          });
          break; // Success, exit loop
        } catch (err: any) {
          lastError = err;
          continue; // Try next URL
        }
      }

      if (!response) {
        throw lastError || new Error("All URLs failed");
      }

      if (!response.ok) {
        const errorText = await response.text();
        log.warn(
          `Failed to warm cache for ${term.name}: HTTP ${response.status} - ${errorText}`
        );
      } else {
        const result = await response.json();
        log.info(`Warmed cache for ${term.name}: ${result.key}`);
      }
    } catch (error: any) {
      log.warn(`Failed to warm cache for ${term.name}: ${error.message}`);
    }
  }
  log.info("Completed catalog cache warming.");
};

export default { updateEnrollmentHistories };
