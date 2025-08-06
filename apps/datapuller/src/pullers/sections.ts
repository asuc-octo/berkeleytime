import { SectionModel, ISectionItem } from "@repo/common";

import { getSectionsWithCallback } from "../lib/sections";
import { Config } from "../shared/config";
import {
  type TermSelector,
  getActiveTerms,
  getLastFiveYearsTerms,
} from "../shared/term-selectors";

const TERMS_PER_API_BATCH = 4;

const processSectionBatch = async (batch: ISectionItem[]) => {
  const { insertedCount } = await SectionModel.insertMany(batch, {
    ordered: false,
    rawResult: true,
  });
  return insertedCount;
};

const updateSections = async (
  { log, sis: { CLASS_APP_ID, CLASS_APP_KEY } }: Config,
  termSelector: TermSelector
) => {
  log.trace(`Fetching terms...`);

  const allTerms = await termSelector(); // includes LAW, Graduate, etc. which are duplicates of Undergraduate
  const terms = allTerms.filter((term) => term.academicCareerCode === "UGRD");

  log.info(
    `Fetched ${terms.length.toLocaleString()} terms: ${terms.map((term) => term.name).toLocaleString()}.`
  );
  if (terms.length == 0) {
    log.warn(`No terms found, skipping update.`);
    return;
  }

  let totalSections = 0;
  let totalInserted = 0;
  for (let i = 0; i < terms.length; i += TERMS_PER_API_BATCH) {
    const termsBatch = terms.slice(i, i + TERMS_PER_API_BATCH);
    const termsBatchIds = termsBatch.map((term) => term.id);

    log.trace(
      `Fetching sections for term ${termsBatch.map((term) => term.name).toLocaleString()}...`
    );

    log.trace("Deleting sections to be replaced...");

    const { deletedCount } = await SectionModel.deleteMany({
      termId: { $in: termsBatchIds },
    });

    log.info(`Deleted ${deletedCount.toLocaleString()} sections.`);

    // Use streaming approach with callback
    await getSectionsWithCallback(
      log,
      CLASS_APP_ID,
      CLASS_APP_KEY,
      termsBatchIds,
      async (batch) => {
        totalSections += batch.length;
        log.trace(`Processing batch of ${batch.length} sections...`);
        
        const insertedCount = await processSectionBatch(batch);
        totalInserted += insertedCount;
      }
    );
  }

  log.info(
    `Completed updating database with ${totalSections.toLocaleString()} sections, inserted ${totalInserted.toLocaleString()} documents.`
  );
};

const activeTerms = async (config: Config) => {
  return updateSections(config, getActiveTerms);
};

const lastFiveYearsTerms = async (config: Config) => {
  return updateSections(config, getLastFiveYearsTerms);
};

export default {
  activeTerms,
  lastFiveYearsTerms,
};
