import { GraphQLError, GraphQLScalarType, Kind } from "graphql";

import { getCourse } from "../course/controller";
import { CourseModule } from "../course/generated-types/module-types";
import { getEnrollmentBySectionId } from "../enrollment/controller";
import { getGradeDistributionByClass } from "../grade-distribution/controller";
import { getClassAggregatedRatings } from "../rating/controller";
import { getTerm } from "../term/controller";
import { TermModule } from "../term/generated-types/module-types";
import {
  getClass,
  getPrimarySection,
  getSecondarySections,
  getSection,
} from "./controller";
import { IntermediateClass, IntermediateSection } from "./formatter";
import { ClassModule } from "./generated-types/module-types";

const resolvers: ClassModule.Resolvers = {
  ClassNumber: new GraphQLScalarType({
    name: "ClassNumber",
    parseValue: (value) => value,
    serialize: (value) => value,
    description:
      "Unique class number (primary section number), such as 001 or 003",
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) return ast.value;

      throw new GraphQLError("Provided value is not a class number", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    },
  }),

  SectionNumber: new GraphQLScalarType({
    name: "SectionNumber",
    parseValue: (value) => value,
    serialize: (value) => value,
    description: "Unique section number, such as 101, 105L, or 999",
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) return ast.value;

      throw new GraphQLError("Provided value is not a section number", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    },
  }),

  SectionIdentifier: new GraphQLScalarType({
    name: "SectionIdentifier",
    parseValue: (value) => value,
    serialize: (value) => value,
    description:
      "Unique 5-digit section identifier (CCN), such as 28082 or 67231",
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING && ast.value.length === 5) return ast.value;

      throw new GraphQLError("Provided value is not a section identifier", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    },
  }),

  Query: {
    class: async (
      _,
      { year, semester, sessionId, subject, courseNumber, number }
    ) => {
      const _class = await getClass(
        year,
        semester,
        sessionId,
        subject,
        courseNumber,
        number
      );

      return _class as unknown as ClassModule.Class;
    },

    section: async (
      _,
      { year, semester, sessionId, subject, courseNumber, number }
    ) => {
      const section = await getSection(
        year,
        semester,
        sessionId,
        subject,
        courseNumber,
        number
      );

      return section as unknown as ClassModule.Section;
    },
  },

  Class: {
    term: async (parent: IntermediateClass | ClassModule.Class) => {
      if (parent.term) return parent.term;

      const term = await getTerm(parent.year, parent.semester);

      return term as unknown as TermModule.Term;
    },

    course: async (parent: IntermediateClass | ClassModule.Class) => {
      if (parent.course) return parent.course;

      const course = await getCourse(parent.subject, parent.courseNumber);

      return course as unknown as CourseModule.Course;
    },

    primarySection: async (parent: IntermediateClass | ClassModule.Class) => {
      if (parent.primarySection) return parent.primarySection;

      const primarySection = await getPrimarySection(
        parent.year,
        parent.semester,
        parent.sessionId,
        parent.subject,
        parent.courseNumber,
        parent.number
      );

      return primarySection as unknown as ClassModule.Section;
    },

    sections: async (parent: IntermediateClass | ClassModule.Class) => {
      if (parent.sections) return parent.sections;

      const secondarySections = await getSecondarySections(
        parent.year,
        parent.semester,
        parent.sessionId,
        parent.subject,
        parent.courseNumber,
        parent.number
      );

      return secondarySections as unknown as ClassModule.Section[];
    },

    gradeDistribution: async (
      parent: IntermediateClass | ClassModule.Class
    ) => {
      if (parent.gradeDistribution) return parent.gradeDistribution;

      const gradeDistribution = await getGradeDistributionByClass(
        parent.year,
        parent.semester,
        parent.sessionId,
        parent.subject,
        parent.courseNumber,
        parent.number
      );

      return gradeDistribution;
    },

    aggregatedRatings: async (
      parent: IntermediateClass | ClassModule.Class
    ) => {
      const aggregatedRatings = await getClassAggregatedRatings(
        parent.year,
        parent.semester,
        parent.subject,
        parent.courseNumber,
        parent.number
      );

      return aggregatedRatings;
    },
  },

  Section: {
    term: async (parent: IntermediateSection | ClassModule.Section) => {
      if (parent.term) return parent.term;

      const term = await getTerm(parent.year, parent.semester);

      return term as TermModule.Term;
    },

    course: async (parent: IntermediateSection | ClassModule.Section) => {
      if (typeof parent.course !== "string") return parent.course;

      const course = await getCourse(parent.subject, parent.courseNumber);

      return course as unknown as CourseModule.Course;
    },

    class: async (parent: IntermediateSection | ClassModule.Section) => {
      if (parent.class) return parent.class;

      const _class = await getClass(
        parent.year,
        parent.semester,
        parent.sessionId,
        parent.subject,
        parent.courseNumber,
        parent.number
      );

      return _class as unknown as ClassModule.Class;
    },

    enrollment: async (parent: IntermediateSection | ClassModule.Section) => {
      if (parent.enrollment) return parent.enrollment;

      const enrollmentHistory = await getEnrollmentBySectionId(
        parent.termId,
        parent.sessionId,
        parent.sectionId
      );

      return enrollmentHistory;
    },

    reservations: async (parent: IntermediateSection | ClassModule.Section) => {
      const enrollment = parent.enrollment && typeof parent.enrollment !== 'string'
        ? parent.enrollment
        : await getEnrollmentBySectionId(parent.termId, parent.sessionId, parent.sectionId);

      if (!enrollment?.seatReservationTypes?.length) {
        return [];
      }

      const latestCounts = enrollment.latest?.seatReservationCounts || [];

      // Map reservation types with their current counts
      return enrollment.seatReservationTypes.map((type: any) => {
        const count = latestCounts.find((c: any) => c.number === type.number);
        return {
          group: type.requirementGroup || "",
          enrollCount: count?.enrolledCount || 0,
          enrollMax: count?.maxEnroll || 0,
        };
      });
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
