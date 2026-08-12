import { CourseModel, ICourseItem } from "@repo/common/models";

import { getCourses } from "../lib/courses";
import { Config } from "../shared/config";

const updateCourses = async (config: Config) => {
  const {
    sis: { COURSE_APP_ID, COURSE_APP_KEY },
    log,
  } = config;

  log.trace(`Fetching courses...`);

  const courses = await getCourses(log, COURSE_APP_ID, COURSE_APP_KEY);

  log.info(`Fetched ${courses.length.toLocaleString()} courses.`);
  if (courses.length === 0) {
    throw new Error("No courses found in SIS.");
  }

  log.trace("Deleting superseded course numbers...");

  const courseKey = ({
    courseId,
    subject,
    number,
  }: Pick<ICourseItem, "courseId" | "subject" | "number">) =>
    `${courseId}|${subject}|${number}`;

  const fetchedCourseIds = [
    ...new Set(courses.map((course) => course.courseId)),
  ];
  const fetchedKeys = new Set(courses.map(courseKey));

  const storedCourses = await CourseModel.find(
    { courseId: { $in: fetchedCourseIds } },
    { courseId: 1, subject: 1, number: 1 }
  ).lean();

  const supersededIds = storedCourses
    .filter((course) => !fetchedKeys.has(courseKey(course)))
    .map((course) => course._id);

  const { deletedCount } = supersededIds.length
    ? await CourseModel.deleteMany({ _id: { $in: supersededIds } })
    : { deletedCount: 0 };

  log.info(`Deleted ${deletedCount.toLocaleString()} superseded courses.`);

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
