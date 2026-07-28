import { DateTime } from "luxon";
import nodemailer from "nodemailer";

import { parseTermName } from "@repo/common";
import {
  IEnrollmentSingularItem,
  NewEnrollmentHistoryModel,
  TermModel,
  UserModel,
} from "@repo/common/models";

import { updateCatalogEnrollment } from "../lib/catalog-denormalize";
import { GRANULARITY, getEnrollmentSingulars } from "../lib/enrollment";
import { computeActiveReservedMaxCount } from "../lib/enrollment-utils";
import { Config } from "../shared/config";

// duration of time in seconds that can pass before being considered a data gap
const DATAGAP_THRESHOLD = 4 * GRANULARITY;

const TERMS_PER_API_BATCH = 4;

const HOT_COURSE_THRESHOLD = 0.8;
const DROP_THRESHOLD = 0.05;
const MIN_OPEN_SPOTS = 3;
const MAX_SNAPSHOT_GAP_MS = 30 * 60 * 1000;

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

const seatReservationTypesEqual = (
  a: NonNullable<IEnrollmentSingularItem["seatReservationTypes"]>,
  b: NonNullable<IEnrollmentSingularItem["seatReservationTypes"]>
) => {
  if (a.length !== b.length) return false;

  const byNumber = (arr: typeof a) =>
    arr
      .map((item) => ({
        number: item.number,
        code: item.requirementGroup?.code ?? null,
        description: item.requirementGroup?.description ?? null,
      }))
      .sort((x, y) => (x.number ?? 0) - (y.number ?? 0));

  const aSorted = byNumber(a);
  const bSorted = byNumber(b);

  return aSorted.every(
    (item, idx) =>
      item.number === bSorted[idx].number &&
      item.code === bSorted[idx].code &&
      item.description === bSorted[idx].description
  );
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
  const requirementGroupStats = { present: 0, missing: 0 };

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
      termsBatchIds,
      requirementGroupStats
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

        // Keep seatReservationTypes fresh if new data differs from stored
        if (
          existingDoc &&
          enrollmentSingular.seatReservationTypes &&
          enrollmentSingular.seatReservationTypes.length > 0
        ) {
          const existingTypes = existingDoc.seatReservationTypes ?? [];
          const incomingTypes = enrollmentSingular.seatReservationTypes ?? [];
          const hasUnknown = existingTypes.some(
            (t) =>
              !t.requirementGroup?.description ||
              t.requirementGroup.description === "Unknown"
          );

          const needsUpdate =
            hasUnknown ||
            existingTypes.length === 0 ||
            !seatReservationTypesEqual(existingTypes, incomingTypes);

          if (needsUpdate) {
            bulkOps.push({
              updateOne: {
                filter: { _id: existingDoc._id },
                update: { $set: { seatReservationTypes: incomingTypes } },
              },
            });
          }
        }
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
    `Seat reservation groups: ${requirementGroupStats.present.toLocaleString()} with descriptions, ${requirementGroupStats.missing.toLocaleString()} missing.`
  );

  log.info(
    `Completed updating database with ${totalEnrollmentSingulars.toLocaleString()} enrollments: ${totalInserted.toLocaleString()} inserted, ${totalUpdated.toLocaleString()} updated.`
  );

  // Update enrollment fields on denormalized catalog_classes.
  // Re-fetch the latest enrollment snapshot for each term we updated.
  for (const term of terms) {
    const parsed = parseTermName(term.name);
    if (!parsed) continue;
    const { year, semester } = parsed;

    // Get all enrollment histories for this term
    const histories = await NewEnrollmentHistoryModel.find({
      year,
      semester,
    })
      .select({
        sectionId: 1,
        seatReservationTypes: 1,
        history: { $slice: -1 },
      })
      .lean();

    const termEnrollments = new Map<
      string,
      {
        status?: string;
        enrolledCount?: number;
        maxEnroll?: number;
        waitlistedCount?: number;
        maxWaitlist?: number;
        activeReservedMaxCount?: number;
      }
    >();

    for (const hist of histories) {
      const latest = hist.history?.[0];
      if (!latest) continue;
      termEnrollments.set(hist.sectionId, {
        status: latest.status,
        enrolledCount: latest.enrolledCount,
        maxEnroll: latest.maxEnroll,
        waitlistedCount: latest.waitlistedCount,
        maxWaitlist: latest.maxWaitlist,
        activeReservedMaxCount: computeActiveReservedMaxCount(
          latest.seatReservationCount,
          hist.seatReservationTypes
        ),
      });
    }

    if (termEnrollments.size > 0) {
      await updateCatalogEnrollment(log, year, semester, termEnrollments);
    }
  }
  log.info("Completed catalog cache warming.");
  await checkEnrollmentDrop(config);
};

const checkEnrollmentDrop = async (config: Config) => {
  const { log, email } = config;

  if (!email) {
    log.warn("SMTP not configured, skipping enrollment drop notifications.");
    return;
  }

  log.trace("Starting enrollment drop checks...");
  // 1. search active terms
  const terms = await TermModel.find({
    academicCareerCode: "UGRD",
    temporalPosition: { $in: ["Current", "Future"] },
  }).lean();

  if (terms.length === 0) {
    log.warn("No active terms found, skipping.");
    return;
  }

  const termIds = terms.map((t) => t.id);

  // 2. search enrollment histories
  const histories = await NewEnrollmentHistoryModel.find(
    { termId: { $in: termIds } },
    { history: { $slice: -2 } }
  ).lean();

  // 3. setup nodemailer
  const transporter = nodemailer.createTransport({
    host: email.host,
    port: email.port,
    secure: false,
    requireTLS: true,
    auth: {
      user: email.user,
      pass: email.password,
    },
  });

  // 4. for every history, check 5 conditions
  for (const history of histories) {
    if (!history.history || history.history.length < 2) continue;

    const latest = history.history[history.history.length - 1];
    const previous = history.history[history.history.length - 2];

    if (latest.enrolledCount == null || latest.maxEnroll == null) continue;
    if (previous.enrolledCount == null || previous.maxEnroll == null) continue;

    // Condition 1: time protection
    const gapMs =
      new Date(latest.endTime).getTime() - new Date(previous.endTime).getTime();
    if (gapMs > MAX_SNAPSHOT_GAP_MS) continue;

    // Condition 2: class is popular
    const currentPct = latest.enrolledCount / latest.maxEnroll;
    if (currentPct < HOT_COURSE_THRESHOLD) continue;

    // Condition 3: significant drop
    const previousPct = previous.enrolledCount / previous.maxEnroll;
    const drop = previousPct - currentPct;
    if (drop < DROP_THRESHOLD) continue;

    // Condition 4: sufficient empty seats
    const openSpots = latest.maxEnroll - latest.enrolledCount;
    if (openSpots < MIN_OPEN_SPOTS) continue;

    // 5. search for unnotified users who subscribed to this class
    const users = await UserModel.find({
      notificationsOn: true,
      monitoredClasses: {
        $elemMatch: {
          "class.year": history.year,
          "class.semester": history.semester,
          "class.subject": history.subject,
          "class.courseNumber": history.courseNumber,
          "class.number": history.sectionNumber,
          notified: false,
        },
      },
    }).lean();

    // 6. send email + notified = true
    for (const user of users) {
      if (!user.email) continue;

      try {
        await transporter.sendMail({
          from: email.from,
          to: user.email,
          subject: `Spot opened in ${history.subject} ${history.courseNumber}`,
          html: `
            <p>Hi ${user.name},</p>
            <p>${history.subject} ${history.courseNumber} section ${history.sectionNumber}
            now has ${openSpots} open spot(s) (${Math.round(currentPct * 100)}% full).</p>
            <p>Go to Calcentral to enroll.</p>
          `,
        });

        await UserModel.updateOne(
          {
            _id: user._id,
            "monitoredClasses.class.year": history.year,
            "monitoredClasses.class.semester": history.semester,
            "monitoredClasses.class.subject": history.subject,
            "monitoredClasses.class.courseNumber": history.courseNumber,
            "monitoredClasses.class.number": history.sectionNumber,
          },
          { $set: { "monitoredClasses.$.notified": true } }
        );

        log.info(
          `✓ Email sent to ${user.email} for ${history.subject} ${history.courseNumber}`
        );
      } catch (err) {
        log.error(`✗ Failed to send email to ${user.email}:`, err);
      }
    }
  }

  log.info("Enrollment drop check complete.");
};

export default { updateEnrollmentHistories };
