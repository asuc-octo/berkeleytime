import mongoose from "mongoose";

import { updateClasses } from "./class";
import { Config } from "./config";
import { updateCourses } from "./course";
import { updateSections } from "./section";
import setup from "./shared";

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

export const runDatapuller = async () => {
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

    config.log.info("\n=== DATA PULLING COMPLETED ===");
  } catch (error) {
    config.log.error(error);
    process.exit(1);
  }

  process.exit(0);
};
