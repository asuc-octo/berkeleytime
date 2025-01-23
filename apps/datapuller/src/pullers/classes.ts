import { NewClassModel } from "@repo/common";

import { getClasses } from "../lib/classes";
import { getActiveTerms } from "../lib/terms";
import { Config } from "../shared/config";

const updateClasses = async ({
  log,
  sis: { TERM_APP_ID, TERM_APP_KEY, CLASS_APP_ID, CLASS_APP_KEY },
}: Config) => {
  log.info(`Fetching active terms.`);

  const activeTerms = await getActiveTerms(log, TERM_APP_ID, TERM_APP_KEY);

  log.info(`Fetched ${activeTerms.length.toLocaleString()} active terms.`);

  log.info(`Fetching classes for active terms`);

  const classes = await getClasses(
    log,
    CLASS_APP_ID,
    CLASS_APP_KEY,
    activeTerms.map((term) => term.id as string)
  );

  log.info(
    `Fetched ${classes.length.toLocaleString()} classes for active terms.`
  );

  // Delete existing classes for active terms
  await NewClassModel.deleteMany({
    "session.term.id": { $in: activeTerms },
  });

  // Insert classes in batches of 5000
  const insertBatchSize = 5000;

  for (let i = 0; i < classes.length; i += insertBatchSize) {
    const batch = classes.slice(i, i + insertBatchSize);

    log.info(`Inserting batch ${i / insertBatchSize + 1}...`);

    await NewClassModel.insertMany(batch, { ordered: false });
  }

  log.info(
    `Completed updating database with ${classes.length.toLocaleString()} classes ${activeTerms.length.toLocaleString()} for active terms`
  );
};

export default updateClasses;
