import {
  getCatalog,
  getClass,
  getClassById,
  getClassSections,
  getCourse,
  getCourseById,
  getCourseClasses,
  getCourseList,
  getCourseSections,
  getCrossListing,
  getPrimarySection,
  getRequiredCourses,
  getSection,
} from "./controller";
import { CatalogModule } from "./generated-types/module-types";

const resolvers: CatalogModule.Resolvers = {
  Query: {
    catalog: (_, args, __, info) => getCatalog(args.term, info),
    course: (_, args, __, info) =>
      getCourse(args.subject, args.courseNumber, args.term, info),
    class: (_, args) =>
      getClass(args.subject, args.courseNumber, args.term, args.classNumber),
    section: (_, args) =>
      getSection(
        args.subject,
        args.courseNumber,
        args.term,
        args.classNumber,
        args.sectionNumber
      ),
    courseList: (_, __, ___, info) => getCourseList(info),
  },

  /*
        TODO: Figure out how to better type the parent objects.
        Apollo likes to assume they are the GraphQL types, but they are actually 
        the information from formatter.ts that is then used to get the GraphQL types.
    */
  Class: {
    course: (parent) => {
      const c = parent.course as any;
      return getCourseById(c.id, c.term);
    },
    sections: (parent) => {
      const s = parent.sections as any;
      return getClassSections(s.id, s.term, s.classNumber);
    },
    primarySection: (parent) => {
      const s = parent.primarySection as any;
      if (!s.term) return parent.primarySection;
      return getPrimarySection(s.id, s.term, s.classNumber);
    },
  },

  Section: {
    class: (parent) => {
      const c = parent.class as any;
      return getClassById(c.id, c.term, c.classNumber);
    },
    course: (parent) => {
      const c = parent.course as any;
      return getCourseById(c.id, c.term);
    },
  },

  Course: {
    classes: (parent, { term }) => {
      const c = parent.classes as any;
      if (typeof c !== "string") return parent.classes;
      return getCourseClasses(c, term);
    },
    crossListing: (parent) => {
      const cl = parent.crossListing as any;
      return getCrossListing(cl.displayNames, cl.term);
    },
    sections: (parent, { term }) => {
      const c = parent.classes as any;
      return getCourseSections(c, term);
    },
    requiredCourses: (parent) => {
      const rc = parent.requiredCourses as any;
      return getRequiredCourses(rc);
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
