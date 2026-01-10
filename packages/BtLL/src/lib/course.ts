import { ISelectedCourse } from "@/lib/api";
import { GetCourseRequirementsQuery } from "@/lib/generated/graphql";

import { argSplit } from "../helper";
import { BtLLConfig, Data, FunctionMapEntry, Variables } from "../types";

export type Course = {
  subject: Data<string>;
  number: Data<string>;
  units: Data<number>;
  breadthRequirements: Data<string[]>;
  universityRequirement: Data<string>;
};

export const definedFields = [
  "subject",
  "number",
  "units",
  "universityRequirement",
  "breadthRequirements",
];

export function courseAdapter(
  course: ISelectedCourse & {
    course?: NonNullable<GetCourseRequirementsQuery["course"]>;
  }
): Course {
  return {
    subject: {
      data: course.courseName.split(" ")[0],
      type: "string",
    },
    number: {
      data: course.courseName.split(" ")[1],
      type: "string",
    },
    units: {
      data: course.courseUnits,
      type: "number",
    },
    universityRequirement: {
      data: course.course?.mostRecentClass?.requirementDesignation?.code ?? "",
      type: "string",
    },
    breadthRequirements: {
      data:
        course.course?.mostRecentClass?.primarySection?.sectionAttributes
          ?.filter((s) => s.attribute.code === "GE")
          .map((sectionAttribute) => sectionAttribute.attribute.description)
          .filter((s) => s !== null && s !== undefined) ?? [],
      type: "List<string>",
    },
  };
}

export const constructor = (
  _: string,
  v: string,
  __: Variables,
  config?: BtLLConfig
): Data<Course> => {
  // Parse the course string (e.g., "COMPSCI 61A" or (subject, number) or (subject, number, shouldFetch))
  const parts = argSplit(v.substring(1, v.length - 1));

  let subject: string;
  let number: string;
  let shouldFetch: boolean = true;

  if (parts.length === 3) {
    // Format: (subject, number, shouldFetch)
    subject = parts[0].trim();
    number = parts[1].trim();
    const fetchFlag = parts[2].trim().toLowerCase();
    shouldFetch = fetchFlag === "true" || fetchFlag === "1";
  } else if (parts.length === 2) {
    // Format: (subject, number)
    subject = parts[0].trim();
    number = parts[1].trim();
  } else if (parts.length === 1) {
    // Format: "COMPSCI 61A"
    const courseParts = parts[0].trim().split(" ");
    if (courseParts.length < 2) {
      throw new Error(
        `Invalid course format: ${v}. Expected format: "SUBJECT NUMBER" or (subject, number) or (subject, number, shouldFetch)`
      );
    }
    subject = courseParts[0];
    number = courseParts.slice(1).join(" ");
  } else {
    throw new Error(
      `Invalid course format: ${v}. Expected format: "SUBJECT NUMBER" or (subject, number) or (subject, number, shouldFetch)`
    );
  }

  // If fetchCourse is provided and shouldFetch is true, use it to get course data
  // Note: If fetchCourse is async, we can't await it here, so we'll create a minimal course
  // In practice, fetchCourse should be called before construction or return synchronously
  let courseData:
    | (ISelectedCourse & {
        course?: NonNullable<GetCourseRequirementsQuery["course"]>;
      })
    | null = null;

  if (config?.fetchCourse && shouldFetch) {
    try {
      const fetched = config.fetchCourse(subject, number);
      // Handle both sync and async results
      if (fetched instanceof Promise) {
        // If it's a promise, we can't wait for it synchronously
        // Create a minimal course for now
        if (config.debug) {
          console.warn(
            `fetchCourse returned a Promise for ${subject} ${number}, creating minimal course`
          );
        }
      } else {
        // Synchronous result
        courseData = fetched;
      }
    } catch (error) {
      // If fetch fails, we'll create a minimal course with just subject and number
      if (config?.debug) {
        console.warn(`Failed to fetch course ${subject} ${number}:`, error);
      }
    }
  }

  // If we have course data, use courseAdapter; otherwise create minimal course
  if (courseData) {
    const adapted = courseAdapter(courseData);
    return {
      data: adapted,
      type: "Course",
    };
  } else {
    // Create a minimal course with just subject and number
    return {
      data: {
        subject: {
          data: subject,
          type: "string",
        },
        number: {
          data: number,
          type: "string",
        },
        units: {
          data: 0,
          type: "number",
        },
        universityRequirement: {
          data: "",
          type: "string",
        },
        breadthRequirements: {
          data: [],
          type: "List<string>",
        },
      },
      type: "Course",
    };
  }
};

// Helper function to check if two courses are equal (by subject and number)
const coursesEqual = (course1: Course, course2: Course): boolean => {
  return (
    course1.subject.data === course2.subject.data &&
    course1.number.data === course2.number.data
  );
};

export const functions: FunctionMapEntry[] = [
  [
    "one_common_course",
    {
      type: "Function<boolean>(List<Course>, List<Course>)",
      data: {
        eval: (
          _: Variables,
          list1: Data<Array<Course>>,
          list2: Data<Array<Course>>
        ) => {
          // Check if there's at least one course in common between the two lists
          for (const course1 of list1.data) {
            for (const course2 of list2.data) {
              if (coursesEqual(course1, course2)) {
                return { data: true, type: "boolean" };
              }
            }
          }
          return { data: false, type: "boolean" };
        },
        args: ["List<Course>", "List<Course>"],
      },
    },
  ],
  [
    "all_common_courses",
    {
      type: "Function<boolean>(List<Course>, List<Course>)",
      data: {
        eval: (
          _: Variables,
          list1: Data<Array<Course>>,
          list2: Data<Array<Course>>
        ) => {
          // Check if all courses in list2 (required courses) are present in list1 (student's courses)
          return {
            data: list2.data.every((course2) =>
              list1.data.some((course1) => coursesEqual(course1, course2))
            ),
            type: "boolean",
          };
        },
        args: ["List<Course>", "List<Course>"],
      },
    },
  ],
];
