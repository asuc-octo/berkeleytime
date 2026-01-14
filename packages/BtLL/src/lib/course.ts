import { argSplit } from "../helper";
import { evaluate } from "../interpreter";
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

export const constructor = (
  _: string,
  v: string,
  variables: Variables,
  config?: BtLLConfig
): Data<Course> => {
  // Parse the course string using curly brackets: {"subject", "number"}
  const parts = argSplit(v.substring(1, v.length - 1));

  if (parts.length !== 1 && parts.length !== 2) {
    throw new Error(
      `Invalid course format: ${v}. Expected format: {"subject", "number"}`
    );
  }

  if (parts.length === 1) {
    const name = evaluate(parts[0].trim(), "string", variables, config).data;
    return {
      data: {
        subject: { data: name.split(" ")[0], type: "string" },
        number: { data: name.split(" ")[1], type: "string" },
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

  const subject = parts[0].trim();
  const number = parts[1].trim();

  const subjectData = evaluate(subject, "string", variables, config);
  const numberData = evaluate(number, "string", variables, config);

  // Create a course with subject and number
  return {
    data: {
      subject: subjectData,
      number: numberData,
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
  [
    "common_course_matches",
    {
      type: "Function<List<boolean>>(List<Course>, List<Course>)",
      data: {
        eval: (
          _: Variables,
          list1: Data<Array<Course>>,
          list2: Data<Array<Course>>
        ) => {
          return {
            data: list1.data.map((course1) =>
              list2.data.some((course2) => coursesEqual(course1, course2))
            ),
            type: "List<boolean>",
          };
        },
        args: ["List<Course>", "List<Course>"],
      },
    },
  ],
];
