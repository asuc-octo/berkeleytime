import { expect, test } from "@playwright/test";

/**
 * API tests for Course-related GraphQL queries
 * These tests validate the GraphQL API endpoints directly
 */

test.describe("Course API", () => {
  test("can query courses", async ({ request }) => {
    const response = await request.post("/api/graphql", {
      data: {
        query: `
          query GetCourses {
            courses {
              courseId
              subject
              number
              title
            }
          }
        `,
      },
    });

    expect(response.ok()).toBeTruthy();
    const { data } = await response.json();

    expect(data).toBeDefined();
    expect(data.courses).toBeDefined();
    expect(Array.isArray(data.courses)).toBe(true);
    expect(data.courses.length).toBeGreaterThan(0);
  });

  test("can query a specific course", async ({ request }) => {
    const response = await request.post("/api/graphql", {
      data: {
        query: `
          query GetCourse($subject: String!, $number: CourseNumber!) {
            course(subject: $subject, number: $number) {
              courseId
              subject
              number
              title
              description
            }
          }
        `,
        variables: {
          subject: "COMPSCI",
          number: "61A",
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const { data } = await response.json();

    expect(data).toBeDefined();
    expect(data.course).toBeDefined();
    expect(data.course.subject).toBe("COMPSCI");
    expect(data.course.number).toBe("61A");
  });

  test("handles invalid query gracefully", async ({ request }) => {
    const response = await request.post("/api/graphql", {
      data: {
        query: `
          query {
            invalidField {
              doesNotExist
            }
          }
        `,
      },
    });

    const data = await response.json();

    // GraphQL should return errors for invalid queries
    expect(data.errors).toBeDefined();
    expect(Array.isArray(data.errors)).toBe(true);
  });
});
