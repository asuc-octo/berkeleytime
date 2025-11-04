import { CourseModel } from "@repo/common";

import { getCourses } from "../lib/courses";
import { Config } from "../shared/config";

const updateCourses = async ({
  sis: { COURSE_APP_ID, COURSE_APP_KEY },
  log,
}: Config) => {
  log.trace(`Fetching courses...`);

  const courses = await getCourses(log, COURSE_APP_ID, COURSE_APP_KEY);

  log.info(`Fetched ${courses.length.toLocaleString()} courses.`);
  if (courses.length === 0) {
    log.error("No courses found, skipping update.");
    return;
  }

  log.trace("Deleting courses no longer in SIS...");

  const { deletedCount } = await CourseModel.deleteMany({
    courseId: { $nin: courses.map((course) => course.courseId) },
  });

  log.info(`Deleted ${deletedCount.toLocaleString()} courses.`);

  // Insert courses in batches of 5000
  const insertBatchSize = 5000;
  for (let i = 0; i < courses.length; i += insertBatchSize) {
    const batch = courses.slice(i, i + insertBatchSize);

    log.trace(`Inserting batch ${i / insertBatchSize + 1}...`);

    await CourseModel.bulkWrite(
      batch.map((course) => ({
        updateOne: {
          filter: {
            courseId: course.courseId,
            subject: course.subject,
            number: course.number,
          },
          update: { $set: course },
          upsert: true,
        },
      }))
    );
  }

  log.info(
    `Completed updating database with ${courses.length.toLocaleString()} courses.`
  );
};

export default { updateCourses };
