import { IClassItem, NewClassModel } from "@repo/common";
import { ClassesAPI } from "@repo/sis-api/classes";

import { Config } from "../config";
import mapClassToNewClass, { CombinedClass } from "../parsers/class";
import { fetchActiveTerms, fetchPaginatedData } from "../shared/utils";

export async function updateClasses(config: Config) {
  const log = config.log.getSubLogger({ name: "ClassesPuller" });
  const classesAPI = new ClassesAPI();

  log.info("Fetching Active Terms");
  const activeTerms = await fetchActiveTerms(log, {
    app_id: config.sis.TERM_APP_ID,
    app_key: config.sis.TERM_APP_KEY,
  });
  log.info(`Active term IDs: ${activeTerms}`);

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

  log.info("Example class:", classes[0]);

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

  log.info(`Completed updating database with ${classes.length} classes for ${activeTerms.length} active terms.`);
}
