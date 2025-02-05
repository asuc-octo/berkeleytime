import { NewSectionModel } from "@repo/common";

import { getSections } from "../lib/sections";
import { Config } from "../shared/config";
import { type TermSelector } from "../shared/term-selectors";

const updateSections = async ({
  log,
  sis: { CLASS_APP_ID, CLASS_APP_KEY },
}: Config, termSelector: TermSelector) => {
  log.trace(`Fetching terms...`);

  const allTerms = await termSelector(); // includes LAW, Graduate, etc. which are duplicates of Undergraduate
  const terms = allTerms.filter(
    (term) => term.academicCareerCode === "UGRD"
  );

  log.info(
    `Fetched ${terms.length.toLocaleString()} terms: ${terms.map((term) => term.name).toLocaleString()}.`
  );
  if (terms.length == 0) {
    log.warn(`No terms found, skipping update.`);
    return;
  }
  const termIds = terms.map((term) => term.id);

  log.trace(`Fetching sections...`);

  const sections = await getSections(
    log,
    CLASS_APP_ID,
    CLASS_APP_KEY,
    termIds,
  );

  log.info(
    `Fetched ${sections.length.toLocaleString()} sections.`
  );
  if (!sections) {
    log.warn(`No sections found, skipping update.`);
    return;
  }

  log.trace("Deleting sections to be replaced...");

  const { deletedCount } = await NewSectionModel.deleteMany({
    termId: { $in: termIds },
  });

  log.info(`Deleted ${deletedCount.toLocaleString()} sections.`);

  // Insert sections in batches of 5000
  let totalInserted = 0;
  const insertBatchSize = 5000;
  for (let i = 0; i < sections.length; i += insertBatchSize) {
    const batch = sections.slice(i, i + insertBatchSize);

    log.trace(`Inserting batch ${i / insertBatchSize + 1}...`);

    const { insertedCount } = await NewSectionModel.insertMany(batch, { ordered: false, rawResult: true });
    totalInserted += insertedCount;
  }

  log.info(
    `Completed updating database with ${sections.length.toLocaleString()} sections, inserted ${totalInserted.toLocaleString()} documents.`
  );
};

export default updateSections;
