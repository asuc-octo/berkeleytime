import { TermModel } from "@repo/common";
import { getEnrollmentTimePeriods } from "../lib/enrollment-periods";
import { Config } from "../shared/config";

const updateEnrollmentPeriods = async ({ log }: Config) => {
  log.trace("Fetching enrollment phase time periods from GCal...");

  try {
    const timePeriodData = await getEnrollmentTimePeriods(log);

    log.info(`Fetched ${timePeriodData.length} time period entries.`);

    if (timePeriodData.length === 0) {
      log.info("No enrollment time periods found.");
      return;
    }

    // Update each semester's time periods
    for (const { semester, timePeriods } of timePeriodData) {
      const result = await TermModel.updateOne(
        { name: semester },
        { $set: { timePeriods } },
        { upsert: false } // Only update existing terms
      );

      if (result.matchedCount > 0) {
        log.info(`Updated ${semester} with ${timePeriods.length} time periods`);
      } else {
        log.warn(`No matching term found for semester: ${semester}`);
      }
    }

    log.info("Completed enrollment phase update.");
  } catch (error) {
    log.error("Error updating enrollment periods:", error);
    throw error;
  }
};

export default { updateEnrollmentPeriods };
