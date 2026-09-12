import { expect, test } from "@playwright/test";

import { persistedOperationBySource } from "../helpers/persisted-operation";

const COURSE_OPERATIONS_SOURCE = "apps/frontend/src/lib/api/courses.ts";

test.describe("Persisted course operations", () => {
  test("an allowlisted campus-data operation succeeds", async ({ request }) => {
    const response = await request.post("/api/graphql", {
      data: persistedOperationBySource(COURSE_OPERATIONS_SOURCE, "GetCourses"),
    });

    expect(response.ok()).toBeTruthy();
    const { data, errors } = await response.json();
    expect(errors).toBeUndefined();
    expect(Array.isArray(data.courses)).toBe(true);
  });

  test("an allowlisted operation accepts its intended variables", async ({
    request,
  }) => {
    const response = await request.post("/api/graphql", {
      data: persistedOperationBySource(
        COURSE_OPERATIONS_SOURCE,
        "GetCourseTitle",
        {
          subject: "THIS_SUBJECT_DOES_NOT_EXIST",
          number: "000",
        }
      ),
    });

    expect(response.ok()).toBeTruthy();
    const { data, errors } = await response.json();
    expect(errors).toBeUndefined();
    expect(data).toHaveProperty("course");
  });
});
