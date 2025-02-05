import {
  IEnrollmentSingularItem,
  NewEnrollmentHistoryModel,
} from "@repo/common";

import { getEnrollmentSingulars } from "../lib/enrollment";
import { Config } from "../shared/config";
import { getActiveTerms } from "../shared/term-selectors";

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
    a.seatReservations == undefined || a.seatReservations.length == 0;
  const bSeatReservationsEmpty =
    b.seatReservations == undefined || b.seatReservations.length == 0;
  if (aSeatReservationsEmpty != bSeatReservationsEmpty) {
    return false;
  }

  if (a.seatReservations && b.seatReservations) {
    if (a.seatReservations.length !== b.seatReservations.length) return false;
    for (const aSeats of a.seatReservations) {
      const bSeats = b.seatReservations.find(
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
}: Config) => {
  log.trace(`Fetching terms...`);

  const allTerms = await getActiveTerms(); // includes LAW, Graduate, etc. which are duplicates of Undergraduate
  const terms = allTerms.filter(
    (term) => term.academicCareerCode === "UGRD"
  );

  log.info(
    `Fetched ${terms.length.toLocaleString()} terms: ${terms.map((term) => term.name).toLocaleString()}.`
  );
  if (terms.length == 0) {
    log.warn(`No terms found, skipping update.`);
    return;
  }
  const termIds = terms.map((term) => term.id);

  log.trace(`Fetching enrollments`);

  const enrollmentSingulars = await getEnrollmentSingulars(
    log,
    CLASS_APP_ID,
    CLASS_APP_KEY,
    termIds
  );

  log.info(
    `Fetched ${enrollmentSingulars.length.toLocaleString()} enrollments.`
  );
  if (!enrollmentSingulars) {
    log.warn(`No enrollments found, skipping update.`);
    return;
  }

  let updateCount = 0;
  for (const enrollmentSingular of enrollmentSingulars) {
    const session = await NewEnrollmentHistoryModel.startSession();

    await session.withTransaction(async () => {
      // find existing history
      const doc = await NewEnrollmentHistoryModel.findOne(
        {
          termId: enrollmentSingular.termId,
          sessionId: enrollmentSingular.sessionId,
          sectionId: enrollmentSingular.sectionId,
        },
        null,
        { session }
      ).lean();

      // skip if no change
      if (doc && doc.history.length > 0) {
        const lastHistory = doc.history[doc.history.length - 1];
        if (enrollmentSingularsEqual(lastHistory, enrollmentSingular.data)) {
          return;
        }
      }

      // append to history array, upsert if needed
      const op = await NewEnrollmentHistoryModel.updateOne(
        {
          termId: enrollmentSingular.termId,
          sessionId: enrollmentSingular.sessionId,
          sectionId: enrollmentSingular.sectionId,
        },
        {
          $push: {
            history: enrollmentSingular.data,
          },
        },
        { upsert: true, session }
      );
      updateCount += op.modifiedCount + op.upsertedCount;
    });

    session.endSession();
  }
  log.info(
    `Completed updating database with ${enrollmentSingulars.length.toLocaleString()} enrollments, updated ${updateCount.toLocaleString()} documents.`
  );
};

export default updateEnrollmentHistories;
