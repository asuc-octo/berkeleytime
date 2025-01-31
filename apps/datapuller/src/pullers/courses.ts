import { ICourseItem, NewCourseModel } from "@repo/common";

import { getCourses } from "../lib/courses";
import { Config } from "../shared/config";

/**
 * Get new array of unique courses, taking the most up-to-date course for each non-unique courseId determined by updatedDate
 */
const getLatestUniqueCourses = (courses: ICourseItem[]) => {
  const latestUniqueCoursesById = new Map<string, ICourseItem>();

  for (const course of courses) {
    const previous = latestUniqueCoursesById.get(course.courseId);

    // if courseId does not exist in map, take the new course
    const previousDoesNotExist = previous === undefined;
    // if previous course does not have an updatedDate, take the new course
    const previousDoesNotHaveUpdatedDate = previous?.updatedDate === undefined;
    // if both courses have an updatedDate and new course is more up-to-date, take the most up-to-date course
    const previousIsOutdated =
      previous?.updatedDate &&
      course.updatedDate &&
      previous.updatedDate < course.updatedDate;

    if (
      previousDoesNotExist ||
      previousDoesNotHaveUpdatedDate ||
      previousIsOutdated
    ) {
      latestUniqueCoursesById.set(course.courseId, course);
    }
  }

  return Array.from(latestUniqueCoursesById.values());
};

const updateCourses = async ({
  sis: { COURSE_APP_ID, COURSE_APP_KEY },
  log,
}: Config) => {
  log.info(`Fetching courses.`);

  // Get all courses
  const allCourses = await getCourses(log, COURSE_APP_ID, COURSE_APP_KEY);
  const courses = getLatestUniqueCourses(allCourses);

  log.info(`Fetched ${courses.length.toLocaleString()} courses.`);

  log.info("Deleting courses no longer in SIS...");
  // Delete existing courses
  const { deletedCount } = await NewCourseModel.deleteMany({
    courseId: { $nin: courses.map((course) => course.courseId) },
  });
  log.info(`Deleted ${deletedCount.toLocaleString()} existing courses.`);

  // Insert courses in batches of 5000
  const insertBatchSize = 5000;

  for (let i = 0; i < courses.length; i += insertBatchSize) {
    const batch = courses.slice(i, i + insertBatchSize);

    log.info(`Inserting batch ${i / insertBatchSize + 1}...`);

    await NewCourseModel.bulkWrite(
      batch.map((course) => ({
        updateOne: {
          filter: { courseId: course.courseId },
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

export default updateCourses;
