import { updateClasses } from "./class";
import { updateCourses } from "./course";
import { updateSections } from "./section";
import setup from "./shared";

const runDatapuller = async () => {
  const { config } = await setup();
  try {
    config.log.info("\n=== UPDATE COURSES ===");
    await updateCourses(config);

    config.log.info("\n=== UPDATE SECTIONS ===");
    await updateSections(config);

    config.log.info("\n=== UPDATE CLASSES ===");
    await updateClasses(config);

    config.log.info("\n=== DATA PULLING COMPLETED ===");
  } catch (error) {
    config.log.error(error);
    process.exit(1);
  }

  process.exit(0);
};

runDatapuller();
