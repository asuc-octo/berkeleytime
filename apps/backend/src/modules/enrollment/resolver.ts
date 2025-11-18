import { getEnrollment } from "./controller";
import { EnrollmentModule } from "./generated-types/module-types";

const resolvers: EnrollmentModule.Resolvers = {
  Query: {
    enrollment: async (
      _,
      { year, semester, sessionId, subject, courseNumber, sectionNumber }
    ) => {
      return await getEnrollment(
        year,
        semester,
        sessionId,
        subject,
        courseNumber,
        sectionNumber
      );
    },
  },
  EnrollmentSingular: {
    hasReservedSeating: (parent) => {
      return (parent.seatReservationCount?.length ?? 0) > 0;
    },
  },
};

export default resolvers;
