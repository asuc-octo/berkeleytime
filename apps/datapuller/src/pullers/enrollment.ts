import { DateTime } from "luxon";
import nodemailer from "nodemailer";

import {
  ENROLLMENT_MILESTONES,
  NOTIFICATION_EVENTS,
  parseTermName,
} from "@repo/common";
import {
  IEnrollmentSingularItem,
  NewEnrollmentHistoryModel,
  TermModel,
  UserModel,
} from "@repo/common/models";

import { updateCatalogEnrollment } from "../lib/catalog-denormalize";
import { GRANULARITY, getEnrollmentSingulars } from "../lib/enrollment";
import {
  describeNotificationEvent,
  detectNotificationEvents,
} from "../lib/enrollment-notifications";
import { computeActiveReservedMaxCount } from "../lib/enrollment-utils";
import { Config } from "../shared/config";

// duration of time in seconds that can pass before being considered a data gap
const DATAGAP_THRESHOLD = 4 * GRANULARITY;

const TERMS_PER_API_BATCH = 4;

// enrollment changes older than this are too stale to email about
const MAX_EVENT_AGE_MS = 30 * 60 * 1000;
const NOTIFICATION_QUERY_BATCH_SIZE = 200;

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
  await sendEnrollmentNotifications(config);
};

const classKey = (c: {
  year: number;
  semester: string;
  subject: string;
  courseNumber: string;
  number: string;
}) => `${c.year}:${c.semester}:${c.subject}:${c.courseNumber}:${c.number}`;

const sendEnrollmentNotifications = async (config: Config) => {
  const { log, email } = config;

  if (!email) {
    log.warn("SMTP not configured, skipping enrollment notifications.");
    return;
  }

  log.trace("Starting enrollment notification checks...");

  // 1. group subscriptions by class
  const users = await UserModel.find({
    notificationsOn: true,
    "monitoredClasses.0": { $exists: true },
  }).lean();

  const subscriptions = new Map<
    string,
    {
      user: (typeof users)[number];
      monitoredClass: NonNullable<
        (typeof users)[number]["monitoredClasses"]
      >[number];
    }[]
  >();
  for (const user of users) {
    if (!user.email) continue;
    for (const monitoredClass of user.monitoredClasses ?? []) {
      if (!monitoredClass.class) continue;
      const key = classKey(monitoredClass.class);
      subscriptions.set(key, [
        ...(subscriptions.get(key) ?? []),
        { user, monitoredClass },
      ]);
    }
  }

  if (subscriptions.size === 0) {
    log.info("No monitored classes, skipping enrollment notifications.");
    return;
  }

  // 2. fetch the last two snapshots of every monitored class
  const classFilters = [...subscriptions.values()].map(
    ([{ monitoredClass }]) => ({
      year: monitoredClass.class!.year,
      semester: monitoredClass.class!.semester,
      subject: monitoredClass.class!.subject,
      courseNumber: monitoredClass.class!.courseNumber,
      sectionNumber: monitoredClass.class!.number,
    })
  );

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

  const now = Date.now();
  let sent = 0;

  for (let i = 0; i < classFilters.length; i += NOTIFICATION_QUERY_BATCH_SIZE) {
    const histories = await NewEnrollmentHistoryModel.find(
      { $or: classFilters.slice(i, i + NOTIFICATION_QUERY_BATCH_SIZE) },
      { history: { $slice: -2 } }
    ).lean();

    for (const history of histories) {
      if (!history.history || history.history.length < 2) continue;

      const latest = history.history[history.history.length - 1];
      const previous = history.history[history.history.length - 2];

      // 3. only announce changes that just happened
      const changedAt = new Date(latest.startTime).getTime();
      if (now - changedAt > MAX_EVENT_AGE_MS) continue;

      const events = detectNotificationEvents(previous, latest);
      if (events.length === 0) continue;

      const subscribers =
        subscriptions.get(
          classKey({ ...history, number: history.sectionNumber })
        ) ?? [];

      for (const { user, monitoredClass } of subscribers) {
        const sessionId = monitoredClass.class!.sessionId;
        if (sessionId && sessionId !== history.sessionId) continue;

        // lean() returns the lastNotifiedAt map as a plain object
        const lastNotifiedAt = (monitoredClass.lastNotifiedAt ?? {}) as Record<
          string,
          Date | undefined
        >;
        const selected = monitoredClass.events?.length
          ? monitoredClass.events
          : NOTIFICATION_EVENTS;

        // 4. skip events the user didn't pick or was already emailed about
        const due = events.filter((event) => {
          if (!selected.includes(event)) return false;
          const last = lastNotifiedAt[event];
          if (!last) return true;
          if (ENROLLMENT_MILESTONES[event] !== undefined) return false;
          return new Date(last).getTime() < changedAt;
        });
        if (due.length === 0) continue;

        const classLabel = `${history.subject} ${history.courseNumber}`;
        const classUrl = `https://berkeleytime.com/catalog/${history.year}/${history.semester}/${encodeURIComponent(history.subject)}/${encodeURIComponent(history.courseNumber)}/${history.sectionNumber}`;

        try {
          await transporter.sendMail({
            from: email.from,
            to: user.email,
            subject:
              due.length === 1 && due[0] === "UNRESERVED_SEAT_OPENS"
                ? `Spot opened in ${classLabel}`
                : `Enrollment update for ${classLabel}`,
            html: `
              <p>Hi ${user.name},</p>
              <p>There's news about <strong>${classLabel} section ${history.sectionNumber}</strong> (${history.semester} ${history.year}):</p>
              <ul>
                ${due.map((event) => `<li>${describeNotificationEvent(event, previous, latest)}</li>`).join("")}
              </ul>
              <p>It's currently at ${latest.enrolledCount ?? 0} of ${latest.maxEnroll ?? 0} seats, with ${latest.waitlistedCount ?? 0} waitlisted. Go to CalCentral to enroll.</p>
              <p><a href="${classUrl}">View the class on Berkeleytime</a> · <a href="https://berkeleytime.com/profile/notifications">Manage notifications</a></p>
            `,
          });

          await UserModel.updateOne(
            { _id: user._id },
            {
              $set: {
                "monitoredClasses.$[mc].notified": true,
                ...Object.fromEntries(
                  due.map((event) => [
                    `monitoredClasses.$[mc].lastNotifiedAt.${event}`,
                    latest.startTime,
                  ])
                ),
              },
            },
            { arrayFilters: [{ "mc._id": monitoredClass._id }] }
          );

          sent += 1;
          log.info(
            `✓ Email sent to ${user.email} for ${classLabel} (${due.join(", ")})`
          );
        } catch (err) {
          log.error(`✗ Failed to send email to ${user.email}:`, err);
        }
      }
    }
  }

  log.info(`Enrollment notification check complete: ${sent} emails sent.`);
};

export default { updateEnrollmentHistories };
