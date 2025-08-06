import { CourseModel, ICourseItem } from "@repo/common";

import { getCoursesWithCallback } from "../lib/courses";
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

const processCourseBatch = async (batch: ICourseItem[]) => {
  const result = await CourseModel.bulkWrite(
    batch.map((course) => ({
      updateOne: {
        filter: { courseId: course.courseId },
        update: { $set: course },
        upsert: true,
      },
    }))
  );
  return result.insertedCount + result.modifiedCount + result.upsertedCount;
};

const updateCourses = async ({
  sis: { COURSE_APP_ID, COURSE_APP_KEY },
  log,
}: Config) => {
  log.trace(`Fetching courses...`);

  // For courses, we need to collect all data first for deduplication logic
  // and to know which courses to delete
  const allCourses: ICourseItem[] = [];
  let totalFetched = 0;

  await getCoursesWithCallback(
    log,
    COURSE_APP_ID,
    COURSE_APP_KEY,
    async (batch) => {
      totalFetched += batch.length;
      log.trace(`Fetched batch of ${batch.length} courses (total: ${totalFetched})...`);
      allCourses.push(...batch);
    }
  );

  const courses = getLatestUniqueCourses(allCourses);

  log.info(`Fetched ${totalFetched.toLocaleString()} total courses, ${courses.length.toLocaleString()} unique courses after deduplication.`);
  if (!courses || courses.length === 0) {
    log.warn("No courses found, skipping update.");
    return;
  }

  log.trace("Deleting courses no longer in SIS...");

  const { deletedCount } = await CourseModel.deleteMany({
    courseId: { $nin: courses.map((course) => course.courseId) },
  });

  log.info(`Deleted ${deletedCount.toLocaleString()} courses.`);

  // Process courses in batches of 5000
  let totalProcessed = 0;
  const insertBatchSize = 5000;
  for (let i = 0; i < courses.length; i += insertBatchSize) {
    const batch = courses.slice(i, i + insertBatchSize);

    log.trace(`Processing batch ${Math.floor(i / insertBatchSize) + 1}...`);

    const processedCount = await processCourseBatch(batch);
    totalProcessed += processedCount;
  }

  log.info(
    `Completed updating database with ${courses.length.toLocaleString()} courses, processed ${totalProcessed.toLocaleString()} documents.`
  );
};

export default { updateCourses };
