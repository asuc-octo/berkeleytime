import { connection } from "mongoose";

import { ClassModel } from "@repo/common";

import { getClasses } from "../lib/classes";
import { Config } from "../shared/config";
import {
  type TermSelector,
  getActiveTerms,
  getLastFiveYearsTerms,
} from "../shared/term-selectors";

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
  let totalDeleted = 0;

  const termsBatchIds = terms.map((term) => term.id);
  log.trace(`Fetching classes for ${terms.length.toLocaleString()} terms...`);
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

  // Insert classes in batches of 5000
  for (let i = 0; i < termsBatchIds.length; i += 1) {
    const session = await connection.startSession();
    let currentTerm = termsBatchIds[i];
    try {
      await session.withTransaction(async () => {
        // const batch = classes.slice(i, i + CLASSES_PER_BATCH);
        const batch = classes.filter((x) => x.termId == currentTerm);

        log.trace(`Deleting classes to be replaced in term ${currentTerm}...`);

        const { deletedCount } = await ClassModel.deleteMany({
          termId: currentTerm,
        });

        log.trace(`Inserting term ${currentTerm}...`);

        const { insertedCount } = await ClassModel.insertMany(batch, {
          ordered: false,
          rawResult: true,
        });

        totalDeleted += deletedCount;
        totalInserted += insertedCount;
      });
    } catch (error: any) {
      log.warn(`Error inserting batch: ${error.message}`);
    } finally {
      await session.endSession();
    }
  }

  log.info(`Deleted ${totalDeleted.toLocaleString()} classes`);
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
