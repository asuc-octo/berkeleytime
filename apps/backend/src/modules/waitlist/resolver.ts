import { GraphQLError } from "graphql";

import {
  estimateLambdaFromEnrollmentHistory,
  getWaitlistGetInProbability,
} from "./controller";
import { WaitlistModule } from "./generated-types/module-types";

const resolvers: WaitlistModule.Resolvers = {
  Query: {
    waitlistGetInProbability: async (
      _,
      { k, timeRemainingDays, lambda, section }
    ) => {
      if (k < 0) {
        throw new GraphQLError("k must be non-negative", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      if (timeRemainingDays < 0) {
        throw new GraphQLError("timeRemainingDays must be non-negative", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      let lambdaUsed: number | undefined = lambda ?? undefined;

      if (lambdaUsed === undefined && section) {
        const estimated = await estimateLambdaFromEnrollmentHistory({
          year: section.year,
          semester: section.semester,
          sessionId: section.sessionId ?? null,
          subject: section.subject,
          courseNumber: section.courseNumber,
          sectionNumber: section.sectionNumber,
        });
        if (estimated !== null) lambdaUsed = estimated;
      }

      const result = getWaitlistGetInProbability(
        k,
        timeRemainingDays,
        lambdaUsed
      );

      return {
        probability: result.probability,
        lambdaUsed: result.lambdaUsed,
      };
    },
  },
};

export default resolvers;
