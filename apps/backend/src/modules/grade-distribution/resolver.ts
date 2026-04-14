import {
  getGradeDistributionByClass,
  getGradeDistributionByCourse,
  getGradeDistributionByInstructor,
  getGradeDistributionByInstructorAndSemester,
  getGradeDistributionBySemester,
} from "./controller";
import { GradeDistributionModule } from "./generated-types/module-types";

const resolvers: GradeDistributionModule.Resolvers = {
  Query: {
    grade: async (
      _,
      {
        year,
        semester,
        sessionId,
        subject,
        courseId,
        classNumber,
        familyName,
        givenName,
      }
    ) => {
      // Term-scoped: year, semester, and sessionId must all be set.
      // Instructor only (omit term fields): aggregate grade data for that professor across all terms.

      if (year && semester && sessionId && givenName && familyName) {
        return await getGradeDistributionByInstructorAndSemester(
          year,
          semester,
          sessionId,
          subject,
          courseId,
          familyName,
          givenName
        );
      }

      if (year && semester && sessionId && classNumber) {
        return await getGradeDistributionByClass(
          year,
          semester,
          sessionId,
          subject,
          courseId,
          classNumber
        );
      }

      if (givenName && familyName) {
        return await getGradeDistributionByInstructor(
          subject,
          courseId,
          familyName,
          givenName
        );
      }

      if (year && semester && sessionId) {
        return await getGradeDistributionBySemester(
          year,
          semester,
          sessionId,
          subject,
          courseId
        );
      }

      return await getGradeDistributionByCourse(subject, courseId);
    },
  },
};

export default resolvers;
