import type { Request } from "express";
import { GraphQLError, GraphQLScalarType, Kind } from "graphql";
import type { RedisClientType } from "redis";

import {
  MutationTrackClassViewArgs,
  SectionSectionAttributesArgs,
} from "../../generated-types/graphql";
import { getCourseById } from "../course/controller";
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
  getViewCount,
  trackClassView,
} from "./controller";
import {
  IntermediateClass,
  IntermediateSection,
  filterAndSortInstructors,
} from "./formatter";
import { ClassModule } from "./generated-types/module-types";

interface GraphQLContext {
  req: Request;
  redis: RedisClientType;
  user: {
    _id?: string;
    isAuthenticated: boolean;
    logout: (callback: (err: unknown) => void) => void;
  };
}

/**
 * Type for sections that may have unfiltered instructor data from the database.
 * Used when sections are embedded in responses and need filtering.
 */
type SectionWithRawInstructors = IntermediateSection & {
  meetings?: Array<{
    instructors?: Array<{
      familyName?: string;
      givenName?: string;
      role?: string;
    }>;
  }>;
};

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

  Mutation: {
    trackClassView: async (
      _: unknown,
      {
        year,
        semester,
        sessionId,
        subject,
        courseNumber,
        number,
      }: MutationTrackClassViewArgs,
      context: GraphQLContext
    ) => {
      const result = await trackClassView(
        year,
        semester,
        sessionId ?? "1",
        subject,
        courseNumber,
        number,
        context.req,
        context.redis
      );
      return result.success;
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

      // Use courseId for cross-listed courses to get the correct course
      const course = await getCourseById(parent.courseId);

      // Override course subject and number with class's values for correct grade lookup
      // This ensures cross-listed courses show grades for the specific subject (e.g., DATA C100 not STAT C100)
      return {
        ...course,
        subject: parent.subject,
        number: parent.courseNumber,
      } as unknown as CourseModule.Course;
    },

    primarySection: async (parent: IntermediateClass | ClassModule.Class) => {
      const primarySection = (parent.primarySection ||
        (await getPrimarySection(
          parent.year,
          parent.semester,
          parent.sessionId,
          parent.subject,
          parent.courseNumber,
          parent.number
        ))) as IntermediateSection | ClassModule.Section | null;

      if (!primarySection) {
        return null as unknown as ClassModule.Section;
      }

      // Filter instructors in embedded sections (when queried through course.classes)
      // This ensures filtering works even when primarySection comes from raw DB data
      const sectionWithRawData = primarySection as SectionWithRawInstructors;
      if (sectionWithRawData.meetings) {
        const filteredSection: IntermediateSection = {
          ...sectionWithRawData,
          meetings: sectionWithRawData.meetings.map((meeting) => ({
            ...meeting,
            instructors: filterAndSortInstructors(meeting.instructors),
          })),
        };
        return filteredSection as unknown as ClassModule.Section;
      }

      return primarySection as unknown as ClassModule.Section;
    },

    sections: async (parent: IntermediateClass | ClassModule.Class) => {
      const sections = (parent.sections ||
        (await getSecondarySections(
          parent.year,
          parent.semester,
          parent.sessionId,
          parent.subject,
          parent.courseNumber,
          parent.number
        ))) as (IntermediateSection | ClassModule.Section)[];

      // Filter instructors in all sections
      return sections.map((section) => {
        const sectionWithRawData = section as SectionWithRawInstructors;
        if (sectionWithRawData.meetings) {
          const filteredSection: IntermediateSection = {
            ...sectionWithRawData,
            meetings: sectionWithRawData.meetings.map((meeting) => ({
              ...meeting,
              instructors: filterAndSortInstructors(meeting.instructors),
            })),
          };
          return filteredSection as unknown as ClassModule.Section;
        }
        return section as unknown as ClassModule.Section;
      });
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

    viewCount: async (
      parent: IntermediateClass | ClassModule.Class,
      _args: unknown,
      context: GraphQLContext
    ) => {
      return getViewCount(
        parent.year,
        parent.semester,
        parent.sessionId,
        parent.subject,
        parent.courseNumber,
        parent.number,
        context.redis
      );
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

      // Use courseId (stored in parent.course) for cross-listed courses
      const course = await getCourseById(parent.course);

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

    sectionAttributes: (
      parent: IntermediateSection | ClassModule.Section,
      args: SectionSectionAttributesArgs
    ) => {
      const attributes = parent.sectionAttributes ?? [];

      if (!args.attributeCode) {
        return attributes;
      }

      return attributes.filter(
        (attr) => attr.attribute?.code === args.attributeCode
      );
    },

    meetings: (parent: IntermediateSection | ClassModule.Section) => {
      const meetings = parent.meetings ?? [];

      // Filter instructors to only show Primary Instructors (PI = professors)
      // This prevents TAs from appearing in instructor lists across the application
      return meetings.map((meeting) => ({
        ...meeting,
        instructors: filterAndSortInstructors(meeting.instructors),
      }));
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
