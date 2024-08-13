import { TermModel } from "@repo/common";
import { ClassesAPI } from "@repo/sis-api/classes";
import { CoursesAPI } from "@repo/sis-api/courses";
import { TermsAPI } from "@repo/sis-api/terms";

import setup from "./shared";

async function main() {
  const { log } = setup();

  // Terms API example
  const termsAPI = new TermsAPI();

  await termsAPI.v2.getByTermsUsingGet(
    {
      "temporal-position": "Current",
    },
    {
      headers: {
        app_id: "123",
        app_key: "abc",
      },
    }
  );

  // Courses API example
  const coursesAPI = new CoursesAPI();

  await coursesAPI.v4.findCourseCollectionUsingGet({
    "last-updated-since": "2021-01-01",
  });

  // Classes API example
  const classesAPI = new ClassesAPI();

  await classesAPI.v1.getClassesUsingGet({
    "term-id": "123",
  });

  log.info(TermModel);
}

main();
