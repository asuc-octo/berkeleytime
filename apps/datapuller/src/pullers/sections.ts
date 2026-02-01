import { connection } from "mongoose";

import { SectionModel } from "@repo/common/models";

import { getSections } from "../lib/sections";
import { Config } from "../shared/config";
import {
  type TermSelector,
  getActiveTerms,
  getLastFiveYearsTerms,
} from "../shared/term-selectors";

const TERMS_PER_API_BATCH = 4;
const INSERT_BATCH_SIZE = 5000;

const updateSections = async (config: Config, termSelector: TermSelector) => {
  const {
    log,
    sis: { CLASS_APP_ID, CLASS_APP_KEY },
  } = config;

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
  let totalDeleted = 0;

  for (let i = 0; i < terms.length; i += TERMS_PER_API_BATCH) {
    const termsBatch = terms.slice(i, i + TERMS_PER_API_BATCH);
    const termsBatchIds = termsBatch.map((term) => term.id);
    const session = await connection.startSession();
    try {
      await session.withTransaction(async () => {
        log.trace(
          `Fetching sections for terms ${termsBatch.map((term) => term.name).toLocaleString()}...`
        );

        const sections = await getSections(
          log,
          CLASS_APP_ID,
          CLASS_APP_KEY,
          termsBatchIds
        );

        log.info(`Fetched ${sections.length.toLocaleString()} sections.`);

        if (sections.length === 0) {
          throw new Error(`No sections found, skipping update`);
        }

        log.trace("Deleting sections to be replaced...");

        const { deletedCount } = await SectionModel.deleteMany(
          { termId: { $in: termsBatchIds } },
          { session }
        );

        log.trace(`Inserting batch ${i}`);

        // Batch inserts to avoid transaction timeout/size limits
        let insertedCount = 0;
        for (
          let insertBatchStart = 0;
          insertBatchStart < sections.length;
          insertBatchStart += INSERT_BATCH_SIZE
        ) {
          const insertBatch = sections.slice(
            insertBatchStart,
            insertBatchStart + INSERT_BATCH_SIZE
          );
          const batchResult = await SectionModel.insertMany(insertBatch, {
            ordered: false,
            rawResult: true,
            session,
          });
          insertedCount += batchResult.insertedCount;
          log.info(
            `Inserted ${batchResult.insertedCount.toLocaleString()} sections in insert batch ${insertBatchStart / INSERT_BATCH_SIZE + 1}`
          );
        }

        // avoid replacing data if a non-negligible amount is deleted
        if (insertedCount / deletedCount <= 0.9) {
          throw new Error(
            `Deleted ${deletedCount} sections and inserted only ${insertedCount} in batch ${i}; aborting data insertion process`
          );
        }

        totalDeleted += deletedCount;
        totalInserted += insertedCount;
        totalSections += sections.length;
      });
    } catch (error: any) {
      log.error(`Error inserting batch: ${error.message}`);
    } finally {
      await session.endSession();
    }
  }

  log.info(`Deleted ${totalDeleted.toLocaleString()} total sections`);
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
