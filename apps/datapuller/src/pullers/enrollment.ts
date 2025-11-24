import sgMail from "@sendgrid/mail";
import { DateTime } from "luxon";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import {
  IEnrollmentSingularItem,
  NewEnrollmentHistoryModel,
  TermModel,
  UserModel,
} from "@repo/common";

import { GRANULARITY, getEnrollmentSingulars } from "../lib/enrollment";
import { Config } from "../shared/config";
import { getActiveTerms } from "../shared/term-selectors";

// duration of time in seconds that can pass before being considered a data gap
const DATAGAP_THRESHOLD = 4 * GRANULARITY;

const TERMS_PER_API_BATCH = 4;

interface EnrollmentThreshold {
  percentage: number;
  name: string;
}

const ENROLLMENT_THRESHOLDS: EnrollmentThreshold[] = [
  { percentage: 50, name: "half_full" },
  { percentage: 75, name: "three_quarters_full" },
  { percentage: 90, name: "nearly_full" },
  { percentage: 100, name: "completely_full" },
];

interface EnrollmentAlert {
  termId: string;
  sessionId: string;
  sectionId: string;
  subject: string;
  courseNumber: string;
  sectionNumber: string;
  year: number;
  semester: string;
  threshold: string;
  percentage: number;
  enrolledCount: number;
  maxEnroll: number;
  waitlistedCount: number;
  maxWaitlist: number;
  timestamp: string;
  previousPercentage?: number;
}

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
    backend: { url: BACKEND_URL },
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
                filter: identifier,
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

              Then: Extend the last entry's endTime using atomic $set.

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

            // true if duration from last entry's end time to current time exceeds DATAGAP_THRESHOLD
            const incomingEndTime = DateTime.fromJSDate(
              enrollmentSingular.data.endTime
            );
            const lastEntryEndTime = DateTime.fromJSDate(lastEntry.endTime);
            const withinDatagapThreshold =
              incomingEndTime.diff(lastEntryEndTime, "seconds").seconds <=
              DATAGAP_THRESHOLD;

            if (dataMatches && granularityMatches && withinDatagapThreshold) {
              // Extend the endTime of the last entry using atomic update
              bulkOps.push({
                updateOne: {
                  filter: identifier,
                  update: {
                    $set: { [`history.${lastIndex}.endTime`]: now.toJSDate() },
                  },
                },
              });
            } else {
              // Append a new entry
              bulkOps.push({
                updateOne: {
                  filter: identifier,
                  update: {
                    $push: { history: enrollmentSingular.data },
                  },
                },
              });
            }
            totalUpdated += 1;
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
    `Completed updating database with ${totalEnrollmentSingulars.toLocaleString()} enrollments: ${totalInserted.toLocaleString()} inserted, ${totalUpdated.toLocaleString()} updated.`
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

      const response = await fetch(`${BACKEND_URL}/cache/warm-catalog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, semester }),
      });

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

  // Check enrollment thresholds and send notifications
  await checkEnrollmentThresholds(config);
};

const generateEnrollmentAlertEmail = (
  userEmail: string,
  userName: string,
  alerts: EnrollmentAlert[]
): { to: string; from: string; subject: string; html: string } => {
  const alertsList = alerts
    .map(
      (alert) => `
      <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid #0066cc; background-color: #f5f5f5;">
        <h3 style="margin: 0 0 10px 0; color: #333;">
          ${alert.subject} ${alert.courseNumber} - Section ${alert.sectionNumber}
        </h3>
        <p style="margin: 5px 0; color: #666;">
          <strong>Enrollment Status:</strong> ${alert.threshold.replace(/_/g, " ").toUpperCase()}
        </p>
        <p style="margin: 5px 0; color: #666;">
          <strong>Current Enrollment:</strong> ${alert.enrolledCount}/${alert.maxEnroll} (${alert.percentage}%)
        </p>
        ${
          alert.waitlistedCount > 0
            ? `<p style="margin: 5px 0; color: #666;">
              <strong>Waitlist:</strong> ${alert.waitlistedCount}/${alert.maxWaitlist}
            </p>`
            : ""
        }
        <p style="margin: 5px 0; color: #666;">
          <strong>Term:</strong> ${alert.semester} ${alert.year}
        </p>
      </div>
    `
    )
    .join("");

  // Read the email template
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const templatePath = join(__dirname, "../templates/enrollment-alert-email.html");
  const template = readFileSync(templatePath, "utf-8");

  // Replace placeholders in the template
  const html = template
    .replace("{{userName}}", userName)
    .replace("{{alertsList}}", alertsList);

  return {
    to: userEmail,
    from: process.env.SENDGRID_FROM_EMAIL || "octo.berkeleytime@asuc.org",
    subject: `BerkeleTime Alert: ${alerts.length} class${alerts.length > 1 ? "es" : ""} reached enrollment threshold`,
    html,
  };
};

const checkEnrollmentThresholds = async ({ log }: Config) => {
  log.trace(`Starting enrollment threshold checks...`);

  const allTerms = await getActiveTerms();
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

  if (terms.length === 0) {
    log.warn("No active terms found for enrollment checking");
    return;
  }

  const termIds = terms.map((term) => term.id);
  log.info(
    `Checking enrollment thresholds for ${terms.length} active terms: ${terms.map((term) => term.name).join(", ")}`
  );

  const enrollmentHistories = await NewEnrollmentHistoryModel.find({
    termId: { $in: termIds },
  }).lean();

  log.info(`Found ${enrollmentHistories.length} enrollment histories to check`);

  const alerts: EnrollmentAlert[] = [];
  let totalChecks = 0;

  for (const history of enrollmentHistories) {
    if (!history.history || history.history.length < 2) {
      continue;
    }

    const latestData = history.history[history.history.length - 1];
    const previousData = history.history[history.history.length - 2];

    if (latestData.enrolledCount == null || latestData.maxEnroll == null) {
      continue;
    }

    totalChecks++;

    const currentPercentage = Math.round(
      (latestData.enrolledCount / latestData.maxEnroll) * 100
    );

    const previousPercentage =
      previousData.enrolledCount && previousData.maxEnroll
        ? Math.round(
            (previousData.enrolledCount / previousData.maxEnroll) * 100
          )
        : undefined;

    // Check each threshold
    for (const threshold of ENROLLMENT_THRESHOLDS) {
      const crossedThreshold =
        currentPercentage >= threshold.percentage &&
        (!previousPercentage || previousPercentage < threshold.percentage);

      if (crossedThreshold) {
        alerts.push({
          termId: history.termId,
          sessionId: history.sessionId,
          sectionId: history.sectionId,
          subject: history.subject,
          courseNumber: history.courseNumber,
          sectionNumber: history.sectionNumber,
          year: history.year,
          semester: history.semester,
          threshold: threshold.name,
          percentage: currentPercentage,
          enrolledCount: latestData.enrolledCount,
          maxEnroll: latestData.maxEnroll,
          waitlistedCount: latestData.waitlistedCount || 0,
          maxWaitlist: latestData.maxWaitlist || 0,
          timestamp: latestData.endTime.toString(),
          previousPercentage,
        });
      }
    }
  }

  log.info(`Completed ${totalChecks} enrollment checks`);

  if (alerts.length > 0) {
    log.info(`Found ${alerts.length} enrollment threshold alerts:`);

    const alertsByThreshold = alerts.reduce(
      (acc, alert) => {
        if (!acc[alert.threshold]) {
          acc[alert.threshold] = [];
        }
        acc[alert.threshold].push(alert);
        return acc;
      },
      {} as Record<string, EnrollmentAlert[]>
    );

    for (const [threshold, thresholdAlerts] of Object.entries(
      alertsByThreshold
    )) {
      log.info(`  ${threshold}: ${thresholdAlerts.length} sections`);

      thresholdAlerts.slice(0, 3).forEach((alert) => {
        log.info(
          `    ${alert.subject} ${alert.courseNumber} ${alert.sectionNumber} - ${alert.percentage}% (${alert.enrolledCount}/${alert.maxEnroll})`
        );
      });

      if (thresholdAlerts.length > 3) {
        log.info(`    ... and ${thresholdAlerts.length - 3} more`);
      }
    }

    const usersToNotify = new Map<string, Set<EnrollmentAlert>>();

    for (const alert of alerts) {
      const thresholdPercentage = ENROLLMENT_THRESHOLDS.find(
        (t) => t.name === alert.threshold
      )?.percentage;

      if (!thresholdPercentage) {
        continue;
      }

      const matchingUsers = await UserModel.find({
        notificationsOn: true,
        monitoredClasses: {
          $elemMatch: {
            "class.year": alert.year,
            "class.semester": alert.semester,
            "class.sessionId": alert.sessionId ?? "1",
            "class.subject": alert.subject,
            "class.courseNumber": alert.courseNumber,
            "class.number": alert.sectionNumber,
          },
        },
      }).lean();

      for (const user of matchingUsers) {
        const monitoredClass = user.monitoredClasses?.find(
          (mc) =>
            mc.class &&
            mc.class.year === alert.year &&
            mc.class.semester === alert.semester &&
            (mc.class.sessionId ?? "1") === (alert.sessionId ?? "1") &&
            mc.class.subject === alert.subject &&
            mc.class.courseNumber === alert.courseNumber &&
            mc.class.number === alert.sectionNumber
        );

        if (
          monitoredClass &&
          monitoredClass.thresholds.includes(thresholdPercentage)
        ) {
          const userId = user._id.toString();
          if (!usersToNotify.has(userId)) {
            usersToNotify.set(userId, new Set());
          }
          usersToNotify.get(userId)!.add(alert);
        }
      }
    }

    log.info(`Found ${usersToNotify.size} users to notify`);

    // Initialize SendGrid
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    if (!sendgridApiKey) {
      log.warn("SENDGRID_API_KEY not set - skipping email notifications");
    } else {
      sgMail.setApiKey(sendgridApiKey);
    }

    let emailsSent = 0;
    let emailsFailed = 0;
    let emailsThrottled = 0;

    for (const [userId, userAlerts] of usersToNotify.entries()) {
      log.info(`  User ${userId}: ${userAlerts.size} alert(s)`);

      // Get user email for notifications
      const user = await UserModel.findById(userId).lean();
      if (!user) {
        log.warn(`    User ${userId} not found, skipping`);
        continue;
      }

      // Only send email notifications
      if (!user.notificationsOn) {
        log.info(`User has notifications off, skipping email`);
        continue;
      }

      // Check if user was notified less than 2 hours ago
      if (user.lastNotified) {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        if (new Date(user.lastNotified) > twoHoursAgo) {
          emailsThrottled++;
          log.info(
            `    User was notified less than 2 hours ago, skipping email`
          );
          continue;
        }
      }

      for (const alert of userAlerts) {
        log.info(
          `    - ${alert.subject} ${alert.courseNumber} ${alert.sectionNumber}: ${alert.threshold} (${alert.percentage}%)`
        );
      }

      // Send email if SendGrid is configured
      if (sendgridApiKey && user.email) {
        try {
          const emailData = generateEnrollmentAlertEmail(
            user.email,
            user.name,
            Array.from(userAlerts)
          );

          await sgMail.send(emailData);

          // Update lastNotified after successfully sending email
          await UserModel.findByIdAndUpdate(userId, {
            lastNotified: new Date(),
          });

          emailsSent++;
          log.info(`    ✓ Email sent to ${user.email}`);
        } catch (error) {
          emailsFailed++;
          log.error(`    ✗ Failed to send email to ${user.email}:`, error);
        }
      }
    }

    if (sendgridApiKey) {
      log.info(
        `Email notifications: ${emailsSent} sent, ${emailsFailed} failed, ${emailsThrottled} throttled`
      );
    } else {
      log.info("Email sending skipped - SENDGRID_API_KEY not configured");
    }
  } else {
    log.info("No enrollment threshold alerts detected");
  }
};

export default { updateEnrollmentHistories };
