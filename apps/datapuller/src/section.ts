import { ISectionItem, NewSectionModel } from "@repo/common";
import { ClassSection, ClassesAPI } from "@repo/sis-api/classes";

import { Config } from "./config";
import mapSectionToNewSection from "./shared/sectionParser";
import { fetchActiveTerms, fetchPaginatedData } from "./shared/utils";

export async function updateSections(config: Config) {
  const log = config.log;
  const classesAPI = new ClassesAPI();

  log.info("Fetching Active Terms");
  const activeTerms = await fetchActiveTerms(log, {
    app_id: config.sis.TERM_APP_ID,
    app_key: config.sis.TERM_APP_KEY,
  });

  log.info(activeTerms);

  const sections = await fetchPaginatedData<ISectionItem, ClassSection>(
    log,
    classesAPI.v1,
    activeTerms,
    "getClassSectionsUsingGet",
    {
      app_id: config.sis.CLASS_APP_ID,
      app_key: config.sis.CLASS_APP_KEY,
    },
    (data) => data.apiResponse.response.classSections || [],
    mapSectionToNewSection,
    "classSections"
  );

  log.info("Example Section:", sections[0]);

  await NewSectionModel.deleteMany({ "session.term.id": { $in: activeTerms } });

  // Insert sections in batches of 5000
  const insertBatchSize = 5000;

  for (let i = 0; i < sections.length; i += insertBatchSize) {
    const batch = sections.slice(i, i + insertBatchSize);

    console.log(`Inserting batch ${i / insertBatchSize + 1}...`);

    await NewSectionModel.insertMany(batch, { ordered: false });
  }

  console.log(`Completed updating database with new section data.`);

  log.info(`Updated ${sections.length} sections for active terms`);
}