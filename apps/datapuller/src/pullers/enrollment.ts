import {
  IEnrollmentSingularItem,
  NewEnrollmentHistoryModel,
} from "@repo/common";

import { getEnrollmentSingulars } from "../lib/enrollment";
import { Config } from "../shared/config";
import { getActiveTerms } from "../shared/term-selectors";

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
}: Config) => {
  log.trace(`Fetching terms...`);

  const allTerms = await getActiveTerms(); // includes LAW, Graduate, etc. which are duplicates of Undergraduate
  const terms = allTerms.filter((term) => {
    if (term.academicCareerCode !== "UGRD") {
      return false;
    }

    if (!term.sessions) return true;
    return term.sessions.some((session) => {
      if (!session.enrollBeginDate || !session.enrollEndDate) return false;

      const now = Date.now();
      const enrollBeginDate = new Date(session.enrollBeginDate).getTime();
      const enrollEndDate = new Date(session.enrollEndDate).getTime();

      return now >= enrollBeginDate && now <= enrollEndDate;
    });
  });

  log.info(
    `Fetched ${terms.length.toLocaleString()} terms: ${terms.map((term) => term.name).toLocaleString()}.`
  );
  if (terms.length == 0) {
    log.warn(`No terms found, skipping update.`);
    return;
  }

  let totalEnrollmentSingulars = 0;
  let totalUpdated = 0;
  const updatedTerms = new Set<string>(); // Track unique year-semester combinations
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

        // migration (02/20/2025): add missing identifier fields
        if (
          doc &&
          (!doc.year ||
            !doc.semester ||
            !doc.subject ||
            !doc.courseNumber ||
            !doc.sectionNumber)
        ) {
          await NewEnrollmentHistoryModel.updateOne(
            {
              termId: enrollmentSingular.termId,
              sessionId: enrollmentSingular.sessionId,
              sectionId: enrollmentSingular.sectionId,
            },
            {
              $set: {
                year: enrollmentSingular.year,
                semester: enrollmentSingular.semester,
                subject: enrollmentSingular.subject,
                courseNumber: enrollmentSingular.courseNumber,
                sectionNumber: enrollmentSingular.sectionNumber,
              },
            },
            { session }
          );
        }

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
            $set: {
              seatReservationTypes: enrollmentSingular.seatReservationTypes,
            },
            $push: {
              history: enrollmentSingular.data,
            },
          },
          { upsert: true, session }
        );
        const updated = op.modifiedCount + op.upsertedCount;
        if (updated > 0) {
          totalUpdated += updated;
          // Track this term as updated
          updatedTerms.add(
            `${enrollmentSingular.year}-${enrollmentSingular.semester.toLowerCase()}`
          );
        }
      });

      session.endSession();
    }
  }

  log.info(
    `Completed updating database with ${totalEnrollmentSingulars.toLocaleString()} enrollments, updated ${totalUpdated.toLocaleString()} documents.`
  );

  // TODO: Call backend warm endpoint for updated terms
  // updatedTerms contains Set of "year-semester" strings that were modified
  if (updatedTerms.size > 0) {
    log.info(
      `${updatedTerms.size} term(s) were updated:`,
      Array.from(updatedTerms)
    );
  }
};

export default { updateEnrollmentHistories };
