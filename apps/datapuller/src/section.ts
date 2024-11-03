import { ISectionItem, SectionModel } from "@repo/common";
import { ClassSection, ClassesAPI } from "@repo/sis-api/classes";

import setup from "./shared";
import { Config } from "./shared/config";
import mapSectionToNewSection from "./shared/sectionParser";
import { fetchActiveTerms, fetchPaginatedData } from "./shared/utils";

async function updateSections(config: Config) {
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
    mapSectionToNewSection
  );

  log.info("Example Section:", sections[0]);

  log.info(`Updated ${sections.length} sections for Spring 2024`);

  await SectionModel.deleteMany({});

  // Insert sections in batches of 5000
  const insertBatchSize = 5000;

  for (let i = 0; i < sections.length; i += insertBatchSize) {
    const batch = sections.slice(i, i + insertBatchSize);

    console.log(`Inserting batch ${i / insertBatchSize + 1}...`);

    await SectionModel.insertMany(batch, { ordered: false });
  }

  console.log(`Completed updating database with new section data.`);
}

const initialize = async () => {
  const { config } = setup();
  try {
    config.log.info("\n=== UPDATE SECTIONS ===");
    await updateSections(config);
  } catch (error) {
    config.log.error(error);
    process.exit(1);
  }

  process.exit(0);
};

initialize();
