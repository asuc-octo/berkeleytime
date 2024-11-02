import { getEnrollment } from "./controller";
import { EnrollmentModule } from "./generated-types/module-types";

const resolvers: EnrollmentModule.Resolvers = {
  Query: {
    enrollment: async (
      _,
      { year, semester, subject, courseNumber, number }
    ) => {
      const enrollment = await getEnrollment(
        year,
        semester,
        subject,
        courseNumber,
        number
      );

      return enrollment as unknown as EnrollmentModule.Section;
    },
  },
};

export default resolvers;
