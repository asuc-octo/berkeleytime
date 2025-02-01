import {
  IEnrollmentSingularItem,
  NewEnrollmentHistoryModel,
} from "@repo/common";

import { getEnrollmentSingulars } from "../lib/enrollment";
import { getActiveTerms } from "../lib/terms";
import { Config } from "../shared/config";

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
  sis: { TERM_APP_ID, TERM_APP_KEY, CLASS_APP_ID, CLASS_APP_KEY },
}: Config) => {
  log.info(`Fetching active terms.`);

  const allActiveTerms = await getActiveTerms(log, TERM_APP_ID, TERM_APP_KEY); // includes LAW, Graduate, etc. which are duplicates of Undergraduate
  const activeTerms = allActiveTerms.filter(
    (term) => term.academicCareer?.description === "Undergraduate"
  );

  log.info(
    `Fetched ${activeTerms.length.toLocaleString()} undergraduate active terms: ${activeTerms.map((term) => term.name).toLocaleString()}.`
  );

  log.info(`Fetching enrollment for active terms.`);

  const enrollmentSingulars = await getEnrollmentSingulars(
    log,
    CLASS_APP_ID,
    CLASS_APP_KEY,
    activeTerms.map((term) => term.id as string)
  );

  log.info(
    `Fetched ${enrollmentSingulars.length.toLocaleString()} enrollments for active terms.`
  );

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
    `Completed updating database with ${enrollmentSingulars.length.toLocaleString()} enrollments, modified ${updateCount.toLocaleString()} documents for ${activeTerms.length.toLocaleString()} active terms.`
  );
};

export default updateEnrollmentHistories;
