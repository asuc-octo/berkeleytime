import { getEnrollment } from "./controller";
import { EnrollmentModule } from "./generated-types/module-types";

const resolvers: EnrollmentModule.Resolvers = {
  Query: {
    enrollment: async (_, { termId, sessionId, sectionId }) =>
      getEnrollment(termId, sessionId, sectionId),
  },
};

export default resolvers;
