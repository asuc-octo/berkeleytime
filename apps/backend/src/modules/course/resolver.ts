import { GraphQLError, GraphQLScalarType, Kind } from "graphql";

import { getPnpPercentageFromCounts } from "@repo/common";

import { CourseAggregatedRatingsArgs } from "../../generated-types/graphql";
import { getFields } from "../../utils/graphql";
import { getGradeDistributionByCourse } from "../grade-distribution/controller";
import {
  getCourseAggregatedRatings,
  getCourseRatingsCount,
  getInstructorAggregatedRatings,
} from "../rating/controller";
import {
  getAssociatedCoursesById,
  getAssociatedCoursesBySubjectNumber,
  getClassesByCourse,
  getCourse,
  getCourseById,
  getCourses,
} from "./controller";
import { IntermediateCourse } from "./formatter";
import { CourseModule } from "./generated-types/module-types";

const SEMESTER_ORDER = ["Winter", "Spring", "Summer", "Fall"] as const;

const resolvers: CourseModule.Resolvers = {
  CourseIdentifier: new GraphQLScalarType({
    name: "CourseIdentifier",
    parseValue: (value) => value,
    serialize: (value) => value,
    description: "Unique course identifier, such as 148047",
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) return ast.value;

      throw new GraphQLError("Provided value is not a course identifier", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    },
  }),

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
    course: async (_, { subject, number }) => {
      const course = await getCourse(subject, number);

      return course as unknown as CourseModule.Course;
    },

    courseById: async (_, { courseId }) => {
      const course = await getCourseById(courseId);

      return course as unknown as CourseModule.Course;
    },

    courses: async () => {
      const courses = getCourses();

      return courses as unknown as CourseModule.Course[];
    },
  },

  Course: {
    classes: async (parent: IntermediateCourse | CourseModule.Course) => {
      if (parent.classes) return parent.classes;

      const classes = await getClassesByCourse(parent.courseId);

      return classes as unknown as CourseModule.Class[];
    },

    mostRecentClass: async (
      parent: IntermediateCourse | CourseModule.Course
    ) => {
      const classes = parent.classes
        ? null
        : await getClassesByCourse(parent.courseId);

      return (parent.classes ?? classes)!.toSorted((a, b) => {
        if (a.year === b.year) {
          return (
            SEMESTER_ORDER.indexOf(a.semester) -
            SEMESTER_ORDER.indexOf(b.semester)
          );
        }
        return b.year - a.year;
      })[0] as unknown as CourseModule.Class;
    },

    crossListing: async (parent: IntermediateCourse | CourseModule.Course) => {
      // cross listings are stored as `${subject} ${number}`

      if (
        parent.crossListing.length === 0 ||
        typeof parent.crossListing[0] !== "string"
      )
        return parent.crossListing as CourseModule.Course[];

      const associatedCourses = await getAssociatedCoursesBySubjectNumber(
        parent.crossListing as string[]
      );

      return associatedCourses as unknown as CourseModule.Course[];
    },

    requiredCourses: async (
      parent: IntermediateCourse | CourseModule.Course
    ) => {
      // required courses are stored as courseIds

      if (
        parent.requiredCourses.length === 0 ||
        typeof parent.requiredCourses[0] !== "string"
      )
        return parent.requiredCourses as CourseModule.Course[];

      const associatedCourses = await getAssociatedCoursesById(
        parent.requiredCourses as string[]
      );

      return associatedCourses as unknown as CourseModule.Course[];
    },

    gradeDistribution: async (
      parent: IntermediateCourse | CourseModule.Course,
      _args,
      _context,
      info
    ) => {
      const requestedFields = getFields(info.fieldNodes);
      const needsDistribution = requestedFields.includes("distribution");

      if (!needsDistribution) {
        if (parent.gradeDistribution) {
          return {
            ...parent.gradeDistribution,
            distribution: [],
          };
        }

        const { allTimeAverageGrade, allTimePassCount, allTimeNoPassCount } =
          parent as IntermediateCourse;

        return {
          average: allTimeAverageGrade ?? null,
          distribution: [],
          pnpPercentage: getPnpPercentageFromCounts(
            allTimePassCount,
            allTimeNoPassCount
          ),
        };
      }

      if (
        parent.gradeDistribution &&
        parent.gradeDistribution.distribution &&
        parent.gradeDistribution.distribution.length > 0
      )
        return parent.gradeDistribution;

      const gradeDistribution = await getGradeDistributionByCourse(
        parent.subject,
        parent.number
      );

      return gradeDistribution;
    },

    aggregatedRatings: async (
      parent: IntermediateCourse | CourseModule.Course,
      args: CourseAggregatedRatingsArgs
    ) => {
      const aggregatedRatings = await getCourseAggregatedRatings(
        parent.subject,
        parent.number,
        args.metricNames ?? undefined
      );

      return aggregatedRatings;
    },

    instructorAggregatedRatings: async (
      parent: IntermediateCourse | CourseModule.Course
    ) => {
      const instructorRatings = await getInstructorAggregatedRatings(
        parent.subject,
        parent.number
      );

      return instructorRatings;
    },

    ratingsCount: async (parent: IntermediateCourse | CourseModule.Course) => {
      const count = await getCourseRatingsCount(parent.subject, parent.number);
      return count;
    },
  },

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

  // CourseFinalExam: {
  //   D: "To be decided by the instructor when the class is offered",
  //   N: "No final exam",
  //   A: "Alternative method of final assessment",
  //   C: "Common Final Exam",
  //   Y: "Written final exam conducted during the scheduled final exam period",
  // },

  // ClassGradingBasis: {
  //   ESU: "Elective Satisfactory/Unsat",
  //   SUS: "Satisfactory/Unsatisfactory",
  //   OPT: "Student Option",
  //   PNP: "Pass/Not Pass",
  //   BMT: "Multi-Term Course: Not Graded",
  //   GRD: "Graded",
  //   IOP: "Instructor Option",
  // },
};

export default resolvers;
