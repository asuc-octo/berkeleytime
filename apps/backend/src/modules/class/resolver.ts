import { getCourse } from "../course/controller";
import { CourseModule } from "../course/generated-types/module-types";
import { getGradeDistributionByClass } from "../grade-distribution/controller";
import { getTerm } from "../term/controller";
import { TermModule } from "../term/generated-types/module-types";
import { getClass, getPrimarySection, getSecondarySections, getSection, isDecal } from "./controller";
import { IntermediateClass, IntermediateSection } from "./formatter";
import { ClassModule } from "./generated-types/module-types";



const resolvers: ClassModule.Resolvers = {
  Query: {
    class: async (_, { subject, courseNumber, number, year, semester }) => {
      const _class = await getClass(
        year,
        semester,
        subject,
        courseNumber,
        number
      );

      return _class as unknown as ClassModule.Class;
    },

    section: async (_, { subject, courseNumber, number, year, semester }) => {
      const section = await getSection(
        year,
        semester,
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
        parent.subject,
        parent.courseNumber,
        parent.number,
        parent.year,
        parent.semester
      );

      return gradeDistribution;
    },

    decal: async (parent: IntermediateClass | ClassModule.Class) => {
      const primarySection = await getPrimarySection(
        parent.year,
        parent.semester,
        parent.subject,
        parent.courseNumber,
        parent.number
      );

      if (!primarySection) return false;

      return isDecal(primarySection.ccn);
    },
  },

  Section: {
    term: async (parent: IntermediateSection | ClassModule.Section) => {
      if (parent.term) return parent.term;

      const term = await getTerm(parent.year, parent.semester);

      return term as unknown as TermModule.Term;
    },

    class: async (parent: IntermediateSection | ClassModule.Section) => {
      if (parent.class) return parent.class;

      const _class = await getClass(
        parent.year,
        parent.semester,
        parent.subject,
        parent.courseNumber,
        parent.classNumber
      );

      return _class as unknown as ClassModule.Class;
    },

    course: async (parent: IntermediateSection | ClassModule.Section) => {
      if (parent.course) return parent.course;

      const course = await getCourse(parent.subject, parent.courseNumber);

      return course as unknown as CourseModule.Course;
    },
  },

  // @ts-expect-error - Not sure how to type this
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