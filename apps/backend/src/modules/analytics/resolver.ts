import { GraphQLError } from "graphql";

import { RequestContext } from "../../types/request-context";
import { getCloudflareAnalyticsData } from "./controllers/cloudflare";
import { getCollectionAnalyticsData } from "./controllers/collection";
import { getGradTrakAnalyticsData } from "./controllers/plan";
import {
  getOptionalResponseAnalyticsData,
  getRatingAnalyticsData,
  getRatingMetricsAnalyticsData,
} from "./controllers/rating";
import { getSchedulerAnalyticsData } from "./controllers/schedule";
import { getStats } from "./controllers/stats";
import {
  getUserActivityAnalyticsData,
  getUserCreationAnalyticsData,
} from "./controllers/user";

const resolvers = {
  Query: {
    // Dashboard stats
    stats: async () => {
      try {
        return await getStats();
      } catch (error: unknown) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          { extensions: { code: "INTERNAL_SERVER_ERROR" } }
        );
      }
    },

    // User analytics
    userCreationAnalyticsData: async (
      _: unknown,
      __: unknown,
      context: RequestContext
    ) => {
      try {
        return await getUserCreationAnalyticsData(context);
      } catch (error: unknown) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          { extensions: { code: "INTERNAL_SERVER_ERROR" } }
        );
      }
    },

    userActivityAnalyticsData: async (
      _: unknown,
      __: unknown,
      context: RequestContext
    ) => {
      try {
        return await getUserActivityAnalyticsData(context);
      } catch (error: unknown) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          { extensions: { code: "INTERNAL_SERVER_ERROR" } }
        );
      }
    },

    // Scheduler analytics
    schedulerAnalyticsData: async (
      _: unknown,
      __: unknown,
      context: RequestContext
    ) => {
      try {
        return await getSchedulerAnalyticsData(context);
      } catch (error: unknown) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          { extensions: { code: "INTERNAL_SERVER_ERROR" } }
        );
      }
    },

    // GradTrak analytics
    gradTrakAnalyticsData: async (
      _: unknown,
      __: unknown,
      context: RequestContext
    ) => {
      try {
        return await getGradTrakAnalyticsData(context);
      } catch (error: unknown) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          { extensions: { code: "INTERNAL_SERVER_ERROR" } }
        );
      }
    },

    // Rating analytics
    ratingAnalyticsData: async (
      _: unknown,
      __: unknown,
      context: RequestContext
    ) => {
      try {
        return await getRatingAnalyticsData(context);
      } catch (error: unknown) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          { extensions: { code: "INTERNAL_SERVER_ERROR" } }
        );
      }
    },

    ratingMetricsAnalyticsData: async (
      _: unknown,
      __: unknown,
      context: RequestContext
    ) => {
      try {
        return await getRatingMetricsAnalyticsData(context);
      } catch (error: unknown) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          { extensions: { code: "INTERNAL_SERVER_ERROR" } }
        );
      }
    },

    optionalResponseAnalyticsData: async (
      _: unknown,
      __: unknown,
      context: RequestContext
    ) => {
      try {
        return await getOptionalResponseAnalyticsData(context);
      } catch (error: unknown) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          { extensions: { code: "INTERNAL_SERVER_ERROR" } }
        );
      }
    },

    // Collection analytics
    collectionAnalyticsData: async (
      _: unknown,
      __: unknown,
      context: RequestContext
    ) => {
      try {
        return await getCollectionAnalyticsData(context);
      } catch (error: unknown) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          { extensions: { code: "INTERNAL_SERVER_ERROR" } }
        );
      }
    },

    // Cloudflare analytics
    cloudflareAnalyticsData: async (
      _: unknown,
      { days, granularity }: { days: number; granularity?: string },
      context: RequestContext
    ) => {
      try {
        const gran = granularity === "hour" ? "hour" : "day";
        return await getCloudflareAnalyticsData(context, days, gran);
      } catch (error: unknown) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          { extensions: { code: "INTERNAL_SERVER_ERROR" } }
        );
      }
    },
  },
};

export default resolvers;
