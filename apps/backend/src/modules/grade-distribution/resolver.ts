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
        subject,
        courseNumber,
        classNumber,
        year,
        semester,
        givenName,
        familyName,
      }
    ) => {
      if (year && semester && givenName && familyName) {
        return await getGradeDistributionByInstructorAndSemester(
          subject,
          courseNumber,
          year,
          semester,
          givenName,
          familyName
        );
      }

      if (year && semester && classNumber) {
        return await getGradeDistributionByClass(
          subject,
          courseNumber,
          classNumber,
          year,
          semester
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

      if (year && semester) {
        return await getGradeDistributionBySemester(
          subject,
          courseNumber,
          year,
          semester
        );
      }

      return await getGradeDistributionByCourse(subject, courseNumber);
    },
  },
};

export default resolvers;
