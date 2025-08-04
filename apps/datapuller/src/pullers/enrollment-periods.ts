import { TermModel } from "@repo/common";
import {
  fetchPhase1CohortMarkers,
  fetchPhase2Markers,
  fetchAdjustmentMarkers,
} from "../lib/enrollment-periods";
import { Config } from "../shared/config";

/**
 * Puller: update Term documents with enrollment period markers for Fall 2025.
 */
const updateEnrollmentPeriods = async ({ log }: Config) => {
  const TERM_NAME = "2025 Fall";
  log.info(`Updating enrollment periods for term: ${TERM_NAME}`);

  // 1. Fetch markers
  log.info("Fetching Phase 1 cohort markers...");
  const phase1Cohorts = await fetchPhase1CohortMarkers(log);

  log.info("Fetching Phase 2 markers...");
  const phase2Markers = await fetchPhase2Markers(log);

  log.info("Fetching Adjustment period markers...");
  const adjustmentMarkers = await fetchAdjustmentMarkers(log);

  // 2. Map career codes to their Phase 1 cohorts
  const careerMap: Record<string, { periodDescription: string; endDate: string }[]> = {
    UGRD: [
      ...phase1Cohorts.continuing,
      ...phase1Cohorts.freshman,
      ...phase1Cohorts.transfer,
    ],
    UCBX: [...phase1Cohorts.continuing],
    LAW: [...phase1Cohorts.graduate],
    GRAD: [...phase1Cohorts.graduate],
  };

  // 3. Append common Phase 2 and Adjustment markers
  const commonAfter = [...phase2Markers, ...adjustmentMarkers];

  // 4. Perform database updates
  for (const [academicCareerCode, cohortMarkers] of Object.entries(careerMap)) {
    const markersToPush = [...cohortMarkers, ...commonAfter];
    log.info(
      `Pushing ${markersToPush.length} markers to ${academicCareerCode} (${TERM_NAME})`
    );

    const result = await TermModel.updateOne(
      { name: TERM_NAME, academicCareerCode },
      {
        $push: {
          "sessions.0.timePeriods": { $each: markersToPush },
        },
      }
    );

    log.info(
      `${academicCareerCode}: matched=${result.matchedCount}, modified=${result.modifiedCount}`
    );
  }

  log.info("Enrollment period update complete.");
};

export default { updateEnrollmentPeriods };
