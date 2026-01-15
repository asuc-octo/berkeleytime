import { IPlan, IPlanTerm, ISelectedCourse } from "@/lib/api";
import { GetCourseRequirementsQuery } from "@/lib/generated/graphql";

import { Column, Course, JoinedCourse, Plan } from "./helper";

// Adapter functions
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
          .map((sectionAttribute) => sectionAttribute.value?.description)
          .filter((s) => s !== null && s !== undefined) ?? [],
      type: "List<string>",
    },
  };
}

export function columnAdapter(
  term: IPlanTerm & { courses: JoinedCourse[] }
): Column {
  return {
    year: {
      data: term.year,
      type: "number",
    },
    semester: {
      data: term.term,
      type: "string",
    },
    name: {
      data: term.name,
      type: "string",
    },
    courses: {
      data: term.courses,
      type: "List<Course>",
    },
    units: {
      data: term.courses.reduce((acc, course) => acc + course.courseUnits, 0),
      type: "number",
    },
  };
}

export function planAdapter(_plan: IPlan, columns: Column[]): Plan {
  const allCourses = columns.flatMap((column) =>
    column.courses.data.map(courseAdapter)
  );
  return {
    units: {
      data: allCourses.reduce((acc, course) => acc + course.units.data, 0),
      type: "number",
    },
    columns: {
      data: columns,
      type: "List<Column>",
    },
    allCourses: {
      data: allCourses,
      type: "List<Course>",
    },
  };
}
