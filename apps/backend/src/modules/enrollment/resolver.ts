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
    activeReservedMaxCount: (parent) => {
      const seatReservations = parent.seatReservationCount ?? [];
      return seatReservations.reduce((sum, reservation) => {
        const isValid = (reservation as any).isValid ?? false;
        const maxEnroll = reservation.maxEnroll ?? 0;
        return sum + (isValid ? maxEnroll : 0);
      }, 0);
    },
  },
};

export default resolvers;
