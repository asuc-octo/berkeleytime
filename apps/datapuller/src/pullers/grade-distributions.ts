import { GradeDistributionModel } from "@repo/common";

import { getGradeDistributionDataByTerms } from "../lib/grade-distributions";
import { Config } from "../shared/config";
import { TermSelector } from "../shared/term-selectors";

const updateGradeDistributions = async ({
  aws: { DATABASE, S3_OUTPUT, REGION_NAME, WORKGROUP },
  log,
}: Config, termSelector: TermSelector) => {
  log.trace("Fetching terms...");

  const terms = await termSelector();

  log.info(
    `Fetched ${terms.length.toLocaleString()} terms: ${terms.map((term) => term.name).toLocaleString()}.`
  );
  if (terms.length == 0) {
    log.warn("No terms found, skipping update");
    return;
  }
  const termIds = terms.map((term) => term.id);

  log.trace("Fetching grade distributions...");

  const gradeDistributions = await getGradeDistributionDataByTerms(
    DATABASE,
    S3_OUTPUT,
    REGION_NAME,
    WORKGROUP,
    termIds
  );

  log.info(
    `Fetched ${gradeDistributions.length.toLocaleString()} grade distributions.`
  );
  if (!gradeDistributions) {
    log.warn("No grade distributions found, skipping update");
    return;
  }

  log.trace("Deleting grade distributions to be replaced...");

  const { deletedCount } = await GradeDistributionModel.deleteMany({
    termId: { $in: termIds },
  });

  log.info(`Deleted ${deletedCount.toLocaleString()} grade distributions.`);

  // Insert grade distributions in batches of 5000
  let totalInserted = 0;
  const insertBatchSize = 5000;
  for (let i = 0; i < gradeDistributions.length; i += insertBatchSize) {
    const batch = gradeDistributions.slice(i, i + insertBatchSize);

    log.trace(`Inserting batch ${i / insertBatchSize + 1}`);

    const { insertedCount } = await GradeDistributionModel.insertMany(batch, { ordered: false, rawResult: true });
    totalInserted += insertedCount;
  }

  log.info(
    `Completed updating database with ${gradeDistributions.length.toLocaleString()} grade distributions, inserted ${totalInserted.toLocaleString()} documents.`
  );
};

export default updateGradeDistributions;
