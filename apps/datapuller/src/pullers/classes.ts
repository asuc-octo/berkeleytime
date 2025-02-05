import { NewClassModel } from "@repo/common";

import { getClasses } from "../lib/classes";
import { Config } from "../shared/config";
import { type TermSelector } from "../shared/term-selectors";

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
  const termIds = terms.map((term) => term.id);

  log.trace(`Fetching classes...`);

  const classes = await getClasses(log, CLASS_APP_ID, CLASS_APP_KEY, termIds);

  log.info(`Fetched ${classes.length.toLocaleString()} classes.`);
  if (!classes) {
    log.warn(`No classes found, skipping update.`);
    return;
  }

  log.trace("Deleting classes to be replaced...");

  const { deletedCount } = await NewClassModel.deleteMany({
    termId: { $in: terms.map((term) => term.id) },
  });

  log.info(`Deleted ${deletedCount.toLocaleString()} classes.`);

  // Insert classes in batches of 5000
  let totalInserted = 0;
  const insertBatchSize = 5000;
  for (let i = 0; i < classes.length; i += insertBatchSize) {
    const batch = classes.slice(i, i + insertBatchSize);

    log.trace(`Inserting batch ${i / insertBatchSize + 1}...`);

    const { insertedCount } = await NewClassModel.insertMany(batch, {
      ordered: false,
      rawResult: true,
    });
    totalInserted += insertedCount;
  }

  log.info(
    `Completed updating database with ${classes.length.toLocaleString()} classes, inserted ${totalInserted.toLocaleString()} documents.`
  );
};

export default updateClasses;
