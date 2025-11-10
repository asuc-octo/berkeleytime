import { ClassModel } from "@repo/common";

import { getClasses } from "../lib/classes";
import { Config } from "../shared/config";
import {
  type TermSelector,
  getActiveTerms,
  getLastFiveYearsTerms,
} from "../shared/term-selectors";
import { connection } from "mongoose";

// const TERMS_PER_API_BATCH = 4;
const CLASSES_PER_BATCH = 5000;

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
  
  const termsBatchIds = terms.map((term) => term.id);
  log.trace(
    `Fetching classes for ${terms.length.toLocaleString()} terms...`
  );
  const classes = await getClasses(
      log,
      CLASS_APP_ID,
      CLASS_APP_KEY,
      termsBatchIds
    );

  log.info(`Fetched ${classes.length.toLocaleString()} classes.`);
  if (!classes || classes.length == 0) {
    log.warn(`No classes found, skipping update.`);
    return;
  }
  totalClasses += classes.length;

  log.trace("Deleting classes to be replaced...");

  const { deletedCount } = await ClassModel.deleteMany({
    termId: { $in: termsBatchIds },
  });

  log.info(`Deleted ${deletedCount.toLocaleString()} classes.`);

  // Insert classes in batches of 5000
  for (let i = 0; i < classes.length; i += CLASSES_PER_BATCH) {
    const session = await connection.startSession();
    try {
      await session.withTransaction(async () => {
        const batch = classes.slice(i, i + CLASSES_PER_BATCH);
        //const terms = classes.filter((class) => class.termId === "2258");

        log.trace(`Inserting batch ${i / CLASSES_PER_BATCH + 1}...`);

        const { insertedCount } = await ClassModel.insertMany(batch, {
          ordered: false,
          rawResult: true,
        });
        totalInserted += insertedCount;
      })
    } catch (error: any) {
      log.warn(`Error inserting batch: ${error.message}`);
    } finally {
      await session.endSession();
    }
    
  }

  log.info(
    `Inserted ${totalInserted.toLocaleString()} classes, after fetching ${totalClasses.toLocaleString()} classes.`
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
