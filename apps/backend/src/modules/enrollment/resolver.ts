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

  Enrollment: {
    seatReservationTypes: (parent: EnrollmentModule.Enrollment) => {
      if (!parent.seatReservationTypes?.length) {
        return null;
      }

      const latest = parent.latest;
      const latestCounts = latest?.seatReservationCounts || [];

      // Enrich each seat reservation type with count data on demand
      return parent.seatReservationTypes.map(type => {
        const count = latestCounts.find((c: any) => c.number === type.number);

        return {
          ...type,
          enrolledCount: count?.enrolledCount || 0,
          maxEnroll: count?.maxEnroll || 0,
          openReserved: Math.max(0, (count?.maxEnroll || 0) - (count?.enrolledCount || 0))
        };
      });
    }
  }
};

export default resolvers;
