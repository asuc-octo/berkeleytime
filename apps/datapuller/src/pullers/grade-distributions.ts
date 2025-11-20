import { GradeDistributionModel } from "@repo/common";

import { getGradeDistributionDataByTerms } from "../lib/grade-distributions";
import { Config } from "../shared/config";
import {
  TermSelector,
  getLastFiveYearsTerms,
  getRecentPastTerms,
} from "../shared/term-selectors";

const TERMS_PER_API_BATCH = 100;

const updateGradeDistributions = async (
  config: Config,
  termSelector: TermSelector
) => {
  const {
    aws: { DATABASE, S3_OUTPUT, REGION_NAME, WORKGROUP },
    log,
  } = config;

  log.trace("Fetching terms...");

  const terms = await termSelector();

  log.info(
    `Fetched ${terms.length.toLocaleString()} terms: ${terms.map((term) => term.name).toLocaleString()}.`
  );
  if (terms.length == 0) {
    log.warn("No terms found, skipping update");
    return;
  }

  let totalGradeDistributions = 0;
  let totalInserted = 0;
  for (let i = 0; i < terms.length; i += TERMS_PER_API_BATCH) {
    const termsBatch = terms.slice(i, i + TERMS_PER_API_BATCH);
    const termsBatchIds = termsBatch.map((term) => term.id);

    log.trace(
      `Fetching grade distributions for term ${termsBatch.map((term) => term.name).toLocaleString()}...`
    );

    const gradeDistributions = await getGradeDistributionDataByTerms(
      DATABASE,
      S3_OUTPUT,
      REGION_NAME,
      WORKGROUP,
      termsBatchIds
    );

    log.info(
      `Fetched ${gradeDistributions.length.toLocaleString()} grade distributions.`
    );
    if (gradeDistributions.length === 0) {
      log.error("No grade distributions found, skipping update");
      return;
    }

    log.trace("Deleting grade distributions to be replaced...");

    const { deletedCount } = await GradeDistributionModel.deleteMany({
      termId: { $in: termsBatchIds },
    });

    log.info(`Deleted ${deletedCount.toLocaleString()} grade distributions.`);

    // Insert grade distributions in batches of 5000
    let totalInserted = 0;
    const insertBatchSize = 5000;
    for (let i = 0; i < gradeDistributions.length; i += insertBatchSize) {
      const batch = gradeDistributions.slice(i, i + insertBatchSize);

      log.trace(`Inserting batch ${i / insertBatchSize + 1}`);

      const { insertedCount } = await GradeDistributionModel.insertMany(batch, {
        ordered: false,
        rawResult: true,
      });
      totalInserted += insertedCount;
    }
  }

  log.info(
    `Completed updating database with ${totalGradeDistributions.toLocaleString()} grade distributions, inserted ${totalInserted.toLocaleString()} documents.`
  );
};

const recentPastTerms = async (config: Config) => {
  return updateGradeDistributions(config, getRecentPastTerms);
};

const lastFiveYearsTerms = async (config: Config) => {
  return updateGradeDistributions(config, getLastFiveYearsTerms);
};

export default {
  recentPastTerms,
  lastFiveYearsTerms,
};
