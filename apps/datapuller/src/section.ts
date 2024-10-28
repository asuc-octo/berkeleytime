import { ISectionItem } from "@repo/common";
import { ClassSection, ClassesAPI } from "@repo/sis-api/classes";

import setup from "./shared";
import mapSectionToNewSection from "./shared/parser";
import { fetchPaginatedData } from "./shared/utils";

async function updateSections() {
  const { config, log } = setup();
  const classesAPI = new ClassesAPI();

  const sections = await fetchPaginatedData<ISectionItem, ClassSection>(
    classesAPI.v1,
    "getClassSectionsUsingGet",
    { "term-id": "2248" },
    {
      app_id: config.sis.CLASS_APP_ID,
      app_key: config.sis.CLASS_APP_KEY,
    },
    (data) => data.apiResponse.response.classSections || [],
    mapSectionToNewSection
  );

  log.info(`Updated ${sections.length} sections for Spring 2024`);
}

const initialize = async () => {
  const { log } = setup();
  try {
    log.info("\n=== UPDATE SECTIONS ===");
    await updateSections();
  } catch (error) {
    log.error(error);
    process.exit(1);
  }

  process.exit(0);
};

initialize();
