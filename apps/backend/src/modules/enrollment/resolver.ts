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
    reservedSeatingMaxCount: (parent) => {
      const seatReservations = parent.seatReservationCount ?? [];
      return seatReservations.reduce(
        (sum, reservation) => sum + (reservation.maxEnroll ?? 0),
        0
      );
    },
  },
};

export default resolvers;
