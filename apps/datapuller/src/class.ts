import { ClassModel, IClassItem } from "@repo/common";
import { ClassesAPI } from "@repo/sis-api/classes";

import setup from "./shared";
import mapClassToNewClass, { CombinedClass } from "./shared/classParser";
import { Config } from "./shared/config";
import { fetchActiveTerms, fetchPaginatedData } from "./shared/utils";

async function updateClasses(config: Config) {
  const log = config.log;
  const classesAPI = new ClassesAPI();

  log.info("Fetching Active Terms");
  const activeTerms = await fetchActiveTerms(log, {
    app_id: config.sis.TERM_APP_ID,
    app_key: config.sis.TERM_APP_KEY,
  });

  log.info(activeTerms);

  const classes = await fetchPaginatedData<IClassItem, CombinedClass>(
    log,
    classesAPI.v1,
    activeTerms,
    "getClassesUsingGet",
    {
      app_id: config.sis.CLASS_APP_ID,
      app_key: config.sis.CLASS_APP_KEY,
    },
    (data) => data.apiResponse.response.classes || [],
    mapClassToNewClass
  );

  log.info("Example Class:", classes[0]);

  await ClassModel.deleteMany({
    "session.term.id": { $in: activeTerms },
  });

  // Insert classes in batches of 5000
  const insertBatchSize = 5000;

  for (let i = 0; i < classes.length; i += insertBatchSize) {
    const batch = classes.slice(i, i + insertBatchSize);

    console.log(`Inserting batch ${i / insertBatchSize + 1}...`);

    await ClassModel.insertMany(batch, { ordered: false });
  }

  console.log(`Completed updating database with new class data.`);

  log.info(`Updated ${classes.length} classes for active terms`);
}

const initialize = async () => {
  const { config } = setup();
  try {
    config.log.info("\n=== UPDATE CLASSES ===");
    await updateClasses(config);
  } catch (error) {
    config.log.error(error);
    process.exit(1);
  }

  process.exit(0);
};

initialize();
