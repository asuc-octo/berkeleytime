import { TermModel } from "@repo/common/models";

import { getAllTerms, getNearbyTerms } from "../lib/terms";
import { Config } from "../shared/config";

const updateTerms = async (config: Config, allTerms: boolean) => {
  const {
    log,
    sis: { TERM_APP_ID, TERM_APP_KEY },
  } = config;

  log.trace(`Fetching terms...`);

  const terms = allTerms
    ? await getAllTerms(log, TERM_APP_ID, TERM_APP_KEY)
    : await getNearbyTerms(log, TERM_APP_ID, TERM_APP_KEY);

  log.info(`Fetched ${terms.length.toLocaleString()} terms.`);
  if (terms.length === 0) {
    log.info("No terms found.");
    return;
  }
  // Update terms in batches of 5000. hasCatalogData is derived from class
  // data, so a SIS term refresh must not overwrite it for existing terms.
  // New terms remain hidden until the classes puller confirms catalog data.
  const insertBatchSize = 5000;
  for (let i = 0; i < terms.length; i += insertBatchSize) {
    const batch = terms.slice(i, i + insertBatchSize);

    log.trace(`Updating batch ${i / insertBatchSize + 1}...`);

    await TermModel.bulkWrite(
      batch.map((term) => {
        const sisTermFields: Partial<typeof term> = { ...term };
        delete sisTermFields.hasCatalogData;

        return {
          updateOne: {
            filter: {
              id: term.id,
              academicCareerCode: term.academicCareerCode,
            },
            update: {
              $set: sisTermFields,
              $setOnInsert: { hasCatalogData: false },
            },
            upsert: true,
          },
        };
      })
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
