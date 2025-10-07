import { NewEnrollmentHistoryModel } from "@repo/common";
import { Logger } from "tslog";

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

const checkEnrollmentThresholds = async (config: Config) => {
  const log = config.log || new Logger({
    type: "pretty",
    prettyLogTimeZone: "local",
  });
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

    if (!latestData.enrolledCount || !latestData.maxEnroll) {
      continue; 
    }

    totalChecks++;

    const currentPercentage = Math.round(
      (latestData.enrolledCount / latestData.maxEnroll) * 100
    );

    const previousPercentage = previousData.enrolledCount && previousData.maxEnroll
      ? Math.round((previousData.enrolledCount / previousData.maxEnroll) * 100)
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
          timestamp: latestData.time,
          previousPercentage,
        });
      }
    }
  }

  log.info(`Completed ${totalChecks} enrollment checks`);

  if (alerts.length > 0) {
    log.info(`Found ${alerts.length} enrollment threshold alerts:`);
    
    const alertsByThreshold = alerts.reduce((acc, alert) => {
      if (!acc[alert.threshold]) {
        acc[alert.threshold] = [];
      }
      acc[alert.threshold].push(alert);
      return acc;
    }, {} as Record<string, EnrollmentAlert[]>);

    for (const [threshold, thresholdAlerts] of Object.entries(alertsByThreshold)) {
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

    //Add email sending logic here
    log.info("Enrollment alerts detected - notification system not yet implemented");
  } else {
    log.info("No enrollment threshold alerts detected");
  }
};

export default { checkEnrollmentThresholds };
