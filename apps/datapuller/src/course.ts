import { ICourseItem } from "@repo/common";
import { CoursesAPI } from "@repo/sis-api/courses";

import setup from "./shared";
import { Config } from "./shared/config";
import mapCourseToNewCourse, { CombinedCourse } from "./shared/courseParser";
import { fetchPaginatedData } from "./shared/utils";

async function updateCourses(config: Config) {
  const log = config.log;
  const coursesAPI = new CoursesAPI();

  const courses = await fetchPaginatedData<ICourseItem, CombinedCourse>(
    log,
    coursesAPI.v4,
    [],
    "findCourseCollectionUsingGet",
    {
      app_id: config.sis.COURSE_APP_ID,
      app_key: config.sis.COURSE_APP_KEY,
    },
    (data) => data.apiResponse.response.courses || [],
    mapCourseToNewCourse
  );

  log.info("Example Course:", courses[0]);

  log.info(`Updated ${courses.length} courses for active terms`);
}

const initialize = async () => {
  const { config } = setup();
  try {
    config.log.info("\n=== UPDATE COURSES ===");
    await updateCourses(config);
  } catch (error) {
    config.log.error(error);
    process.exit(1);
  }

  process.exit(0);
};

initialize();
