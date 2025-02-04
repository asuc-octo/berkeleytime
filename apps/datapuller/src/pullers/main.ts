import mongoose from "mongoose";

import setup from "../shared";
import { Config } from "../shared/config";
import updateClasses from "./classes";
import updateCourses from "./courses";
import updateEnrollmentHistories from "./enrollment";
import updateGradeDistributions from "./grade-distributions";
import updateSections from "./sections";

const testDatabaseWrite = async (config: Config) => {
  const TestSchema = new mongoose.Schema({
    testField: String,
    timestamp: Date,
  });

  const TestModel = mongoose.model("Test", TestSchema);

  try {
    const testDocument = new TestModel({
      testField: "Test write from runDatapuller",
      timestamp: new Date(),
    });

    const result = await testDocument.save();
    config.log.info("Test document written successfully:", result);

    return true;
  } catch (error) {
    config.log.error("Error writing to database:", error);
    return false;
  }
};

const main = async () => {
  const { config } = await setup();

  try {
    config.log.info("\n=== TESTING DATABASE WRITE ===");
    const writeSuccessful = await testDatabaseWrite(config);
    if (!writeSuccessful) {
      throw new Error(
        "Failed to write to the database. Please check your connection and permissions."
      );
    }

    config.log.info("\n=== UPDATE COURSES ===");
    await updateCourses(config);

    config.log.info("\n=== UPDATE SECTIONS ===");
    await updateSections(config);

    config.log.info("\n=== UPDATE CLASSES ===");
    await updateClasses(config);

    config.log.info("\n=== UPDATE ENROLLMENTS ===");
    await updateEnrollmentHistories(config);

    config.log.info("\n=== UPDATE GRADES ===");
    await updateGradeDistributions(config);

    config.log.info("\n=== DATA PULLING COMPLETED ===");
  } catch (error) {
    config.log.error(error);
    process.exit(1);
  }

  process.exit(0);
};

export default main;
