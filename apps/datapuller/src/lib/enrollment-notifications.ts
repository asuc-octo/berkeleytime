import sgMail from "@sendgrid/mail";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import {
  EnrollmentSubscriptionModel,
  NewEnrollmentHistoryModel,
  UserModel,
} from "@repo/common";

import { Config } from "../shared/config";
import { getActiveTerms } from "../shared/term-selectors";

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

const renderAlertCard = (alert: EnrollmentAlert) => `
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
    `;

const generateEnrollmentAlertEmail = (
  userEmail: string,
  userName: string,
  alerts: EnrollmentAlert[]
): { to: string; from: string; subject: string; html: string } => {
  const alertsList = alerts.map(renderAlertCard).join("");

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const templatePath = join(
    __dirname,
    "../templates/enrollment-alert-email.html"
  );
  const template = readFileSync(templatePath, "utf-8");

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

export const checkEnrollmentThresholds = async ({ log }: Config) => {
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

  if (alerts.length === 0) {
    log.info("No enrollment threshold alerts detected");
    return;
  }

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
  const thresholdLookup = ENROLLMENT_THRESHOLDS.reduce(
    (acc, t) => ({ ...acc, [t.name]: t.percentage }),
    {} as Record<string, number>
  );
  const classKey = (args: {
    year: number;
    semester: string;
    sessionId?: string;
    subject: string;
    courseNumber: string;
    sectionNumber: string;
  }) =>
    `${args.year}-${args.semester}-${args.sessionId ?? "1"}-${
      args.subject
    }-${args.courseNumber}-${args.sectionNumber}`;

  const alertsByClassKey = new Map<string, EnrollmentAlert[]>();
  const classFilters: {
    year: number;
    semester: string;
    sessionId: string;
    subject: string;
    courseNumber: string;
    sectionNumber: string;
  }[] = [];

  for (const alert of alerts) {
    const key = classKey(alert);
    if (!alertsByClassKey.has(key)) {
      alertsByClassKey.set(key, []);
      classFilters.push({
        year: alert.year,
        semester: alert.semester,
        sessionId: alert.sessionId ?? "1",
        subject: alert.subject,
        courseNumber: alert.courseNumber,
        sectionNumber: alert.sectionNumber,
      });
    }
    alertsByClassKey.get(key)!.push(alert);
  }

  const matchingSubscriptions = await EnrollmentSubscriptionModel.find({
    $or: classFilters,
  }).lean();

  log.info(
    `Found ${matchingSubscriptions.length} matching subscriptions across ${classFilters.length} alerting sections`
  );

  for (const subscription of matchingSubscriptions) {
    const key = classKey({
      year: subscription.year,
      semester: subscription.semester,
      sessionId: subscription.sessionId ?? "1",
      subject: subscription.subject,
      courseNumber: subscription.courseNumber,
      sectionNumber: subscription.sectionNumber,
    });

    const alertsForClass = alertsByClassKey.get(key) ?? [];

    for (const alert of alertsForClass) {
      const thresholdPercentage = thresholdLookup[alert.threshold];
      if (!thresholdPercentage) continue;
      if (!subscription.thresholds?.includes(thresholdPercentage)) continue;

      const userId = subscription.userId.toString();
      if (!usersToNotify.has(userId)) {
        usersToNotify.set(userId, new Set());
      }
      usersToNotify.get(userId)!.add(alert);
    }
  }

  log.info(`Found ${usersToNotify.size} users to notify`);

  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  if (!sendgridApiKey) {
    log.warn("SENDGRID_API_KEY not set - skipping email notifications");
  } else {
    sgMail.setApiKey(sendgridApiKey);
  }

  let emailsSent = 0;
  let emailsFailed = 0;
  let emailsThrottled = 0;

  const userIds = Array.from(usersToNotify.keys());
  const usersById = new Map(
    (
      await UserModel.find(
        { _id: { $in: userIds } },
        "email name notificationsOn lastNotified"
      ).lean()
    ).map((user) => [user._id.toString(), user])
  );

  for (const [userId, userAlerts] of usersToNotify.entries()) {
    log.info(`  User ${userId}: ${userAlerts.size} alert(s)`);

    const user = usersById.get(userId);
    if (!user) {
      log.warn(`    User ${userId} not found, skipping`);
      continue;
    }

    if (!user.notificationsOn) {
      log.info(`User has notifications off, skipping email`);
      continue;
    }

    if (user.lastNotified) {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      if (new Date(user.lastNotified) > twoHoursAgo) {
        emailsThrottled++;
        log.info(`    User was notified less than 2 hours ago, skipping email`);
        continue;
      }
    }

    for (const alert of userAlerts) {
      log.info(
        `    - ${alert.subject} ${alert.courseNumber} ${alert.sectionNumber}: ${alert.threshold} (${alert.percentage}%)`
      );
    }

    if (sendgridApiKey && user.email) {
      try {
        const emailData = generateEnrollmentAlertEmail(
          user.email,
          user.name,
          Array.from(userAlerts)
        );

        await sgMail.send(emailData);

        await UserModel.findByIdAndUpdate(userId, {
          lastNotified: new Date(),
        });

        emailsSent++;
        log.info(`    Email sent to ${user.email}`);
      } catch (error) {
        emailsFailed++;
        log.error(`    Failed to send email to ${user.email}:`, error);
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
};
