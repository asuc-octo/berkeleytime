import { GraphQLError } from "graphql";

import {
  createRating,
  deleteRating,
  getClassAggregatedRatings,
  getSemestersWithRatings,
  getUserClassRatings,
  getUserRatings,
} from "./controller";
import { RatingModule } from "./generated-types/module-types";

const resolvers: RatingModule.Resolvers = {
  Query: {
    aggregatedRatings: async (
      _,
      { year, semester, subject, courseNumber, classNumber },
      __
    ) => {
      try {
        const aggregatedRatings = await getClassAggregatedRatings(
          Number(year),
          semester,
          subject,
          courseNumber,
          classNumber
        );
        return aggregatedRatings as unknown as RatingModule.AggregatedRatings;
      } catch (error: unknown) {
        // Re-throw GraphQLErrors as is
        if (error instanceof GraphQLError) {
          throw error;
        }
        // Convert any other errors to GraphQLError
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          }
        );
      }
    },

    userRatings: async (_, __, context) => {
      try {
        const userRatings = await getUserRatings(context);
        return userRatings as unknown as RatingModule.UserRatings;
      } catch (error: unknown) {
        // Re-throw GraphQLErrors as is
        if (error instanceof GraphQLError) {
          throw error;
        }
        // Convert any other errors to GraphQLError
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          }
        );
      }
    },

    userClassRatings: async (
      _,
      { year, semester, subject, courseNumber, classNumber },
      context
    ) => {
      try {
        const userClassRatings = await getUserClassRatings(
          context,
          Number(year),
          semester,
          subject,
          courseNumber,
          classNumber
        );
        return userClassRatings as unknown as RatingModule.UserClass;
      } catch (error: unknown) {
        // Re-throw GraphQLErrors as is
        if (error instanceof GraphQLError) {
          throw error;
        }
        // Convert any other errors to GraphQLError
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          }
        );
      }
    },

    semestersWithRatings: async (
      _: unknown,
      { subject, courseNumber }: { subject: string; courseNumber: string }
    ) => {
      try {
        const semesters = await getSemestersWithRatings(subject, courseNumber);
        return semesters as unknown as RatingModule.SemesterRatings[];
      } catch (error: unknown) {
        // Re-throw GraphQLErrors as is
        if (error instanceof GraphQLError) {
          throw error;
        }
        // Convert any other errors to GraphQLError
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          }
        );
      }
    },
  },
  Mutation: {
    createRating: async (
      _,
      { year, semester, subject, courseNumber, classNumber, metricName, value },
      context
    ) => {
      try {
        return await createRating(
          context,
          Number(year),
          semester,
          subject,
          courseNumber,
          classNumber,
          metricName,
          value
        );
      } catch (error: unknown) {
        // Re-throw GraphQLErrors as is
        if (error instanceof GraphQLError) {
          throw error;
        }
        // Convert any other errors to GraphQLError
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          }
        );
      }
    },

    deleteRating: async (
      _,
      { year, semester, subject, courseNumber, classNumber, metricName },
      context
    ) => {
      try {
        return await deleteRating(
          context,
          Number(year),
          semester,
          subject,
          courseNumber,
          classNumber,
          metricName
        );
      } catch (error: unknown) {
        // Re-throw GraphQLErrors as is
        if (error instanceof GraphQLError) {
          throw error;
        }
        // Convert any other errors to GraphQLError
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          }
        );
      }
    },
  },
};

export default resolvers;
