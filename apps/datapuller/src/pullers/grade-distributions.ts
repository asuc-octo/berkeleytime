import { GradeDistributionModel } from "@repo/common";

import { getGradeDistributionDataByTerm } from "../lib/grade-distributions";
import { getCurrentTerm } from "../lib/terms";
import { Config } from "../shared/config";

// TODO: Transaction
const updateGradeDistributions = async ({
  aws: { DATABASE, S3_OUTPUT, REGION_NAME, WORKGROUP },
  sis: { TERM_APP_ID, TERM_APP_KEY },
  log,
}: Config) => {
  log.info("Fetching current term");

  // Get current term
  const currentTerm = await getCurrentTerm(log, TERM_APP_ID, TERM_APP_KEY);

  // TODO: Error for no current term
  if (!currentTerm) return;

  log.info("Querying grade distributions for current term");

  // Query grade distributions for current term
  const gradeDistributions = await getGradeDistributionDataByTerm(
    DATABASE,
    S3_OUTPUT,
    REGION_NAME,
    WORKGROUP,
    currentTerm.id as string
  );

  // TODO: Error for no grade distributions
  if (!gradeDistributions) return;

  // Delete existing grade distributions for current term
  await GradeDistributionModel.deleteMany({
    termId: currentTerm.id,
  });

  // Insert grade distributions in batches of 5000
  const insertBatchSize = 5000;

  for (let i = 0; i < gradeDistributions.length; i += insertBatchSize) {
    const batch = gradeDistributions.slice(i, i + insertBatchSize);

    log.info(`Inserting batch ${i / insertBatchSize + 1}`);

    await GradeDistributionModel.insertMany(batch, { ordered: false });
  }

  log.info(
    `Completed updating database with ${gradeDistributions.length.toLocaleString()} courses.`
  );
};

export default updateGradeDistributions;
