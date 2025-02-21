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
        courseNumber,
        classNumber,
        familyName,
        givenName,
      }
    ) => {
      if (year && semester && sessionId && givenName && familyName) {
        return await getGradeDistributionByInstructorAndSemester(
          year,
          semester,
          sessionId,
          subject,
          courseNumber,
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
          courseNumber,
          classNumber
        );
      }

      if (givenName && familyName) {
        return await getGradeDistributionByInstructor(
          subject,
          courseNumber,
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
          courseNumber
        );
      }

      return await getGradeDistributionByCourse(subject, courseNumber);
    },
  },
};

export default resolvers;
