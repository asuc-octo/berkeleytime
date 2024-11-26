import { GraphQLError, GraphQLScalarType, Kind } from "graphql";

import { getGradeDistributionByCourse } from "../grade-distribution/controller";
import {
  getAssociatedCourses,
  getClassesByCourse,
  getCourse,
  getCourses,
} from "./controller";
import { IntermediateCourse } from "./formatter";
import { CourseModule } from "./generated-types/module-types";

const resolvers: CourseModule.Resolvers = {
  CourseNumber: new GraphQLScalarType({
    name: "CourseNumber",
    parseValue: (value) => value,
    serialize: (value) => value,
    description: "Unique course number, such as 61A or C54",
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) return ast.value;

      throw new GraphQLError("Provided value is not a course number", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    },
  }),

  Query: {
    course: async (_, { subject, number }, _context, _info) => {
      const course = await getCourse(subject, number);

      return course as unknown as CourseModule.Course;
    },

    courses: async (_, _arguments, _context, _info) => {
      const courses = getCourses();

      return courses as unknown as CourseModule.Course[];
    },
  },

  Course: {
    classes: async (parent: IntermediateCourse | CourseModule.Course) => {
      if (parent.classes) return parent.classes;

      const classes = await getClassesByCourse(parent.subject, parent.number);

      return classes as unknown as CourseModule.Class[];
    },

    crossListing: async (parent: IntermediateCourse | CourseModule.Course) => {
      if (
        parent.crossListing.length === 0 ||
        typeof parent.crossListing[0] !== "string"
      )
        return parent.crossListing as CourseModule.Course[];

      const associatedCourses = await getAssociatedCourses(
        parent.crossListing as string[]
      );

      return associatedCourses as unknown as CourseModule.Course[];
    },

    requiredCourses: async (
      parent: IntermediateCourse | CourseModule.Course
    ) => {
      if (
        parent.requiredCourses.length === 0 ||
        typeof parent.requiredCourses[0] !== "string"
      )
        return parent.requiredCourses as CourseModule.Course[];

      const associatedCourses = await getAssociatedCourses(
        parent.requiredCourses as string[]
      );

      return associatedCourses as unknown as CourseModule.Course[];
    },

    gradeDistribution: async (
      parent: IntermediateCourse | CourseModule.Course
    ) => {
      if (parent.gradeDistribution) return parent.gradeDistribution;

      const gradeDistribution = await getGradeDistributionByCourse(
        parent.subject,
        parent.number
      );

      return gradeDistribution;
    },
  },

  // @ts-expect-error - Not sure how to type properly
  // Session: {
  //   R: "1",
  //   S: "12W",
  //   A: "6W1",
  //   B: "10W",
  //   C: "8W",
  //   D: "6W2",
  //   E: "3W1",
  //   F: "3W2",
  // },

  CourseFinalExam: {
    D: "To be decided by the instructor when the class is offered",
    N: "No final exam",
    A: "Alternative method of final assessment",
    C: "Common Final Exam",
    Y: "Written final exam conducted during the scheduled final exam period",
  },

  ClassGradingBasis: {
    ESU: "Elective Satisfactory/Unsat",
    SUS: "Satisfactory/Unsatisfactory",
    OPT: "Student Option",
    PNP: "Pass/Not Pass",
    BMT: "Multi-Term Course: Not Graded",
    GRD: "Graded",
    IOP: "Instructor Option",
  },
};

export default resolvers;
