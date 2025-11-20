import {
  CourseModel,
  GradeCounts,
  GradeDistributionModel,
  getAverageGrade,
  getDistribution,
} from "@repo/common";

import { getGradeDistributionDataByTerms } from "../lib/grade-distributions";
import { Config } from "../shared/config";
import {
  TermSelector,
  getLastFiveYearsTerms,
  getRecentPastTerms,
} from "../shared/term-selectors";

const TERMS_PER_API_BATCH = 100;

interface AggregatedCourseGradeSummary extends GradeCounts {
  _id: {
    subject: string;
    courseNumber: string;
  };
}

const rebuildCourseGradeSummaries = async (log: Config["log"]) => {
  log.info("Recomputing course grade summaries...");

  await CourseModel.updateMany(
    {
      $or: [
        { allTimeAverageGrade: { $ne: null } },
        { allTimePassCount: { $ne: null } },
        { allTimeNoPassCount: { $ne: null } },
      ],
    },
    {
      $set: {
        allTimeAverageGrade: null,
        allTimePassCount: null,
        allTimeNoPassCount: null,
      },
    }
  );

  const aggregatedSummaries =
    await GradeDistributionModel.aggregate<AggregatedCourseGradeSummary>([
      {
        $group: {
          _id: { subject: "$subject", courseNumber: "$courseNumber" },
          countAPlus: { $sum: "$countAPlus" },
          countA: { $sum: "$countA" },
          countAMinus: { $sum: "$countAMinus" },
          countBPlus: { $sum: "$countBPlus" },
          countB: { $sum: "$countB" },
          countBMinus: { $sum: "$countBMinus" },
          countCPlus: { $sum: "$countCPlus" },
          countC: { $sum: "$countC" },
          countCMinus: { $sum: "$countCMinus" },
          countDPlus: { $sum: "$countDPlus" },
          countD: { $sum: "$countD" },
          countDMinus: { $sum: "$countDMinus" },
          countF: { $sum: "$countF" },
          countNP: { $sum: "$countNP" },
          countP: { $sum: "$countP" },
          countU: { $sum: "$countU" },
          countS: { $sum: "$countS" },
        },
      },
    ]);

  if (aggregatedSummaries.length === 0) {
    log.warn("No grade distributions found when rebuilding summaries.");
    return;
  }

  const operations = aggregatedSummaries
    .map(({ _id, ...counts }) => {
      const gradeCounts = counts as GradeCounts;
      const distribution = getDistribution([gradeCounts]);
      const averageGrade = getAverageGrade(distribution);
      const passCount = gradeCounts.countP + gradeCounts.countS;
      const noPassCount = gradeCounts.countNP + gradeCounts.countU;
      const hasPnpData = passCount + noPassCount > 0;

      if (averageGrade === null && !hasPnpData) return null;

      return {
        updateMany: {
          filter: { subject: _id.subject, number: _id.courseNumber },
          update: {
            $set: {
              allTimeAverageGrade: averageGrade,
              allTimePassCount: hasPnpData ? passCount : null,
              allTimeNoPassCount: hasPnpData ? noPassCount : null,
            },
          },
        },
      };
    })
    .filter((op): op is NonNullable<typeof op> => op !== null);

  if (operations.length === 0) {
    log.warn("No course summaries to update.");
    return;
  }

  const BULK_BATCH_SIZE = 500;
  let processed = 0;
  for (let i = 0; i < operations.length; i += BULK_BATCH_SIZE) {
    const batch = operations.slice(i, i + BULK_BATCH_SIZE);
    await CourseModel.bulkWrite(batch, { ordered: false });
    processed += batch.length;
  }

  log.info(
    `Updated grade summaries for ${processed.toLocaleString()} course combinations.`
  );
};

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

  await rebuildCourseGradeSummaries(log);
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
