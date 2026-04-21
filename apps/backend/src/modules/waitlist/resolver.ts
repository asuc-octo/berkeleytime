import { GraphQLError } from "graphql";

import {
  estimateLambdaFromEnrollmentHistory,
  getAdjustmentStartMs,
  getWaitlistGetInProbability,
} from "./controller";
import { WaitlistModule } from "./generated-types/module-types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

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
      if (lambda !== undefined && lambda !== null && lambda < 0) {
        throw new GraphQLError("lambda must be non-negative", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      let lambdaUsed: number | undefined = lambda ?? undefined;
      let effectiveTimeRemainingDays = timeRemainingDays;

      if (section) {
        // Clamp the time horizon at the adjustment phase start: after classes
        // begin the waitlist is effectively frozen, so that time shouldn't
        // contribute to the expected number of drops.
        const adjustmentStartMs = await getAdjustmentStartMs(
          section.year,
          section.semester
        );
        if (adjustmentStartMs !== null) {
          const daysUntilAdjustment = Math.max(
            0,
            (adjustmentStartMs - Date.now()) / MS_PER_DAY
          );
          effectiveTimeRemainingDays = Math.min(
            effectiveTimeRemainingDays,
            daysUntilAdjustment
          );
        }

        if (lambdaUsed === undefined) {
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
      }

      const result = getWaitlistGetInProbability(
        k,
        effectiveTimeRemainingDays,
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
