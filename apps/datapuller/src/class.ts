import { IClassItem, NewClassModel } from "@repo/common";
import { ClassesAPI } from "@repo/sis-api/classes";

import { Config } from "./config";
import mapClassToNewClass, { CombinedClass } from "./shared/classParser";
import { fetchActiveTerms, fetchPaginatedData } from "./shared/utils";

export async function updateClasses(config: Config) {
  const log = config.log;
  const classesAPI = new ClassesAPI();

  log.info("Fetching Active Terms");
  const activeTerms = await fetchActiveTerms(log, {
    app_id: config.sis.TERM_APP_ID,
    app_key: config.sis.TERM_APP_KEY,
  });

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
    mapClassToNewClass,
    "classes"
  );
  log.info(activeTerms);

  log.info("Example Class:", classes[0]);

  await NewClassModel.deleteMany({
    "session.term.id": { $in: activeTerms },
  });

  // Insert classes in batches of 5000
  const insertBatchSize = 5000;

  for (let i = 0; i < classes.length; i += insertBatchSize) {
    const batch = classes.slice(i, i + insertBatchSize);

    console.log(`Inserting batch ${i / insertBatchSize + 1}...`);

    await NewClassModel.insertMany(batch, { ordered: false });
  }

  console.log(`Completed updating database with new class data.`);

  log.info(`Updated ${classes.length} classes for active terms`);
}
