import { GradeDistributionModel } from "@repo/common";

import { getGradeDistributionDataByTerms } from "../lib/grade-distributions";
import { getPreviousTerm } from "../lib/terms";
import { Config } from "../shared/config";

const updateGradeDistributions = async ({
  aws: { DATABASE, S3_OUTPUT, REGION_NAME, WORKGROUP },
  sis: { TERM_APP_ID, TERM_APP_KEY },
  log,
}: Config) => {
  log.info("Fetching previous term");

  // Get previous term
  const previousTerms = await getPreviousTerm(log, TERM_APP_ID, TERM_APP_KEY);

  if (!previousTerms) {
    log.error("No previous term found, skipping update");
    return;
  }

  log.info(
    `Querying grade distributions for previous terms: ${previousTerms.map((term) => term.name + " " + term.academicCareer?.description).join(", ")}`
  );
  const previousTermIds = previousTerms.map((term) => term.id!);

  const gradeDistributions = await getGradeDistributionDataByTerms(
    DATABASE,
    S3_OUTPUT,
    REGION_NAME,
    WORKGROUP,
    previousTermIds
  );

  // TODO: Error for no grade distributions
  if (!gradeDistributions) {
    log.error("No grade distributions found, skipping update");
    return;
  }

  log.info(
    `Fetched ${gradeDistributions.length.toLocaleString()} grade distributions.`
  );

  // Delete existing grade distributions for previous terms
  await GradeDistributionModel.deleteMany({
    termId: { $in: previousTermIds },
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
