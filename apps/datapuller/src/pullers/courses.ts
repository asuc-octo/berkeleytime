import { NewCourseModel } from "@repo/common";

import { getCourses } from "../lib/courses";
import { Config } from "../shared/config";

// TODO: Transaction
const updateCourses = async ({
  sis: { COURSE_APP_ID, COURSE_APP_KEY },
  log,
}: Config) => {
  log.info(`Fetching courses.`);

  // Get all courses
  const courses = await getCourses(log, COURSE_APP_ID, COURSE_APP_KEY);

  log.info(`Fetched ${courses.length.toLocaleString()} courses.`);

  // Delete existing courses
  await NewCourseModel.deleteMany({});

  // Insert courses in batches of 5000
  const insertBatchSize = 5000;

  for (let i = 0; i < courses.length; i += insertBatchSize) {
    const batch = courses.slice(i, i + insertBatchSize);

    log.info(`Inserting batch ${i / insertBatchSize + 1}...`);

    await NewCourseModel.insertMany(batch, { ordered: false });
  }

  log.info(
    `Completed updating database with ${courses.length.toLocaleString()} courses.`
  );
};

export default updateCourses;
