import { NewTermModel } from "@repo/common";

import { getAllTerms, getNearbyTerms } from "../lib/terms";
import { Config } from "../shared/config";

const updateTerms = async (
  { sis: { TERM_APP_ID, TERM_APP_KEY }, log }: Config,
  allTerms: boolean
) => {
  log.trace(`Fetching terms...`);

  const terms = allTerms
    ? await getAllTerms(log, TERM_APP_ID, TERM_APP_KEY)
    : await getNearbyTerms(log, TERM_APP_ID, TERM_APP_KEY);

  log.info(`Fetched ${terms.length.toLocaleString()} terms.`);
  if (terms.length === 0) {
    log.info("No terms found.");
    return;
  }
  const termIds = terms.map((term) => term.id);

  log.trace("Deleting terms to be replaced...");

  const { deletedCount } = await NewTermModel.deleteMany({
    id: { $nin: termIds },
  });

  log.info(`Deleted ${deletedCount.toLocaleString()} terms.`);

  // Insert terms in batches of 5000
  const insertBatchSize = 5000;
  for (let i = 0; i < terms.length; i += insertBatchSize) {
    const batch = terms.slice(i, i + insertBatchSize);

    log.trace(`Inserting batch ${i / insertBatchSize + 1}...`);

    await NewTermModel.bulkWrite(
      batch.map((term) => ({
        updateOne: {
          filter: { id: term.id, academicCareerCode: term.academicCareerCode },
          update: { $set: term },
          upsert: true,
        },
      }))
    );
  }

  log.info(
    `Completed updating database with ${terms.length.toLocaleString()} terms.`
  );
};

const allTerms = async (config: Config) => {
  return updateTerms(config, true);
};

const nearbyTerms = async (config: Config) => {
  return updateTerms(config, false);
};

export default {
  allTerms,
  nearbyTerms,
};
