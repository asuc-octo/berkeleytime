import {
  ClassSection,
  ClassSectionPayload,
  ClassesAPI,
} from "@repo/sis-api/classes";

import setup from "./shared";
import mapSectionToNewSection from "./shared/parser";

async function updateSections() {
  const { config } = setup();
  console.log(config);
  // modularize to passing in type of API, then app_id and app_key
  const classesAPI = new ClassesAPI();
  //const sections: NewSectionType[] = [];
  let page = 1;
  let retries = 3;

  while (retries > 0) {
    try {
      const response = await classesAPI.v1.getClassSectionsUsingGet(
        {
          "term-id": "2248",
          "page-number": page,
          "page-size": 100,
        },
        {
          headers: {
            app_id: config.sis.CLASS_APP_ID,
            app_key: config.sis.CLASS_APP_KEY,
          },
        }
      );
      const data = (await response.json()) as ClassSectionPayload;
      if (data) {
        const classSections: ClassSection[] =
          data.apiResponse?.response?.classSections || [];
        //console.log(classSections[0]);
        console.log(mapSectionToNewSection(classSections[0]));
      }
    } catch (error) {
      console.log(`Unexpected error querying SIS API. Error: "${error}"`);

      if (retries === 0) {
        console.log(`Too many errors querying SIS API. Terminating update...`);
        break;
      }

      retries--;

      console.log(`Retrying...`);

      continue;
    }
    page++;
  }

  console.log(`Updating sections for Spring 2024...`);
}

const initialize = async () => {
  try {
    console.log("\n=== UPDATE SECTIONS ===");
    await updateSections();
  } catch (error) {
    console.error(error);

    process.exit(1);
  }

  process.exit(0);
};

initialize();
