import { TermModel } from "@repo/common";

import { getTerms } from "../lib/terms";
import { Config } from "../shared/config";

const updateTerms = async ({
  sis: { TERM_APP_ID, TERM_APP_KEY },
  log,
}: Config) => {
  log.info(`Fetching terms.`);

  // Get all courses
  const terms = await getTerms(log, TERM_APP_ID, TERM_APP_KEY);

  if (terms.length === 0) {
    log.info("No terms found.");

    return;
  }

  log.info(`Fetched ${terms.length.toLocaleString()} terms.`);

  log.info("Deleting terms...");

  // Delete existing terms not in SIS
  const { deletedCount } = await TermModel.deleteMany({
    id: { $nin: terms.map((term) => term.id) },
  });

  log.info(`Deleted ${deletedCount.toLocaleString()} existing terms.`);

  // Insert terms in batches of 5000
  const insertBatchSize = 5000;

  for (let i = 0; i < terms.length; i += insertBatchSize) {
    const batch = terms.slice(i, i + insertBatchSize);

    log.info(`Inserting batch ${i / insertBatchSize + 1}...`);

    await TermModel.bulkWrite(
      batch.map((term) => ({
        updateOne: {
          filter: { id: term.id },
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

export default updateTerms;
