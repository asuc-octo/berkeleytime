import {
  getAssociatedCourses,
  getClassesByCourse,
  getCourse,
  getCourses,
} from "./controller";
import { IntermediateCourse } from "./formatter";
import { CourseModule } from "./generated-types/module-types";

const resolvers: CourseModule.Resolvers = {
  Query: {
    course: async (_, { subject, courseNumber }, _context, info) => {
      const course = await getCourse(subject, courseNumber, info);

      return course as unknown as CourseModule.Course;
    },

    courses: async (_, _arguments, _context, info) => {
      const courses = getCourses(info);

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
