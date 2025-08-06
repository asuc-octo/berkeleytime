import { ClassModel, IClassItem } from "@repo/common";

import { getClassesWithCallback } from "../lib/classes";
import { Config } from "../shared/config";
import {
  type TermSelector,
  getActiveTerms,
  getLastFiveYearsTerms,
} from "../shared/term-selectors";

const TERMS_PER_API_BATCH = 4;

const processClassBatch = async (batch: IClassItem[]) => {
  const { insertedCount } = await ClassModel.insertMany(batch, {
    ordered: false,
    rawResult: true,
  });
  return insertedCount;
};

const updateClasses = async (
  { log, sis: { CLASS_APP_ID, CLASS_APP_KEY } }: Config,
  termSelector: TermSelector
) => {
  log.trace(`Fetching terms....`);

  const allTerms = await termSelector(); // includes LAW, Graduate, etc. which are duplicates of Undergraduate
  const terms = allTerms.filter((term) => term.academicCareerCode === "UGRD");

  log.info(
    `Fetched ${terms.length.toLocaleString()} undergraduate terms: ${terms.map((term) => term.name).toLocaleString()}.`
  );
  if (terms.length == 0) {
    log.warn(`No terms found, skipping update.`);
    return;
  }

  let totalClasses = 0;
  let totalInserted = 0;
  for (let i = 0; i < terms.length; i += TERMS_PER_API_BATCH) {
    const termsBatch = terms.slice(i, i + TERMS_PER_API_BATCH);
    const termsBatchIds = termsBatch.map((term) => term.id);

    log.trace(
      `Fetching classes for term ${termsBatch.map((term) => term.name).toLocaleString()}...`
    );

    log.trace("Deleting classes to be replaced...");

    const { deletedCount } = await ClassModel.deleteMany({
      termId: { $in: termsBatchIds },
    });

    log.info(`Deleted ${deletedCount.toLocaleString()} classes.`);

    // Use streaming approach with callback
    await getClassesWithCallback(
      log,
      CLASS_APP_ID,
      CLASS_APP_KEY,
      termsBatchIds,
      async (batch) => {
        totalClasses += batch.length;
        log.trace(`Processing batch of ${batch.length} classes...`);
        
        const insertedCount = await processClassBatch(batch);
        totalInserted += insertedCount;
      }
    );
  }

  log.info(
    `Completed updating database with ${totalClasses.toLocaleString()} classes, inserted ${totalInserted.toLocaleString()} documents.`
  );
};

const activeTerms = async (config: Config) => {
  return updateClasses(config, getActiveTerms);
};

const lastFiveYearsTerms = async (config: Config) => {
  return updateClasses(config, getLastFiveYearsTerms);
};

export default {
  activeTerms,
  lastFiveYearsTerms,
};
