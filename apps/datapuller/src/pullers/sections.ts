import { NewSectionModel } from "@repo/common";

import { getSections } from "../lib/sections";
import { getActiveTerms } from "../lib/terms";
import { Config } from "../shared/config";

const updateSections = async ({
  log,
  sis: { TERM_APP_ID, TERM_APP_KEY, CLASS_APP_ID, CLASS_APP_KEY },
}: Config) => {
  log.info(`Fetching active terms.`);

  const allActiveTerms = await getActiveTerms(log, TERM_APP_ID, TERM_APP_KEY); // includes LAW, Graduate, etc. which are duplicates of Undergraduate
  const activeTerms = allActiveTerms.filter(
    (term) => term.academicCareer?.description === "Undergraduate"
  );

  log.info(
    `Fetched ${activeTerms.length.toLocaleString()} active terms: ${activeTerms.map((term) => term.name).toLocaleString()}.`
  );

  log.info(`Fetching sections for active terms.`);

  const sections = await getSections(
    log,
    CLASS_APP_ID,
    CLASS_APP_KEY,
    activeTerms.map((term) => term.id as string)
  );

  log.info(
    `Fetched ${sections.length.toLocaleString()} sections for active terms.`
  );

  // Delete existing sections for active terms
  await NewSectionModel.deleteMany({
    termId: { $in: activeTerms.map((term) => term.id) },
  });

  // Insert sections in batches of 5000
  const insertBatchSize = 5000;

  for (let i = 0; i < sections.length; i += insertBatchSize) {
    const batch = sections.slice(i, i + insertBatchSize);

    log.info(`Inserting batch ${i / insertBatchSize + 1}...`);

    await NewSectionModel.insertMany(batch, { ordered: false });
  }

  log.info(
    `Completed updating database with ${sections.length.toLocaleString()} sections for ${activeTerms.length.toLocaleString()} active terms.`
  );
};

export default updateSections;
