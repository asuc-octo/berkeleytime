import { ICourseItem, NewCourseModel } from "@repo/common";
import { CoursesAPI } from "@repo/sis-api/courses";

import { Config } from "./config";
import mapCourseToNewCourse, { CombinedCourse } from "./shared/courseParser";
import { fetchPaginatedData } from "./shared/utils";

export async function updateCourses(config: Config) {
  const log = config.log;
  const coursesAPI = new CoursesAPI();

  const courses = await fetchPaginatedData<ICourseItem, CombinedCourse>(
    log,
    coursesAPI.v4,
    null,
    "findCourseCollectionUsingGet",
    {
      app_id: config.sis.COURSE_APP_ID,
      app_key: config.sis.COURSE_APP_KEY,
    },
    (data) => data.apiResponse.response.courses || [],
    mapCourseToNewCourse,
    "courses"
  );

  log.info("Example Course:", courses[0]);

  await NewCourseModel.deleteMany({});

  // Insert courses in batches of 5000
  const insertBatchSize = 5000;

  for (let i = 0; i < courses.length; i += insertBatchSize) {
    const batch = courses.slice(i, i + insertBatchSize);

    console.log(`Inserting batch ${i / insertBatchSize + 1}...`);

    await NewCourseModel.insertMany(batch, { ordered: false });
  }

  console.log(`Completed updating database with new course data.`);

  log.info(`Updated ${courses.length} courses for active terms`);
}
