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
      { subject, courseNumber, semester, year, classNumber },
      __
    ) => {
      try {
        const aggregatedRatings = await getClassAggregatedRatings(
          subject,
          courseNumber,
          semester,
          year,
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
      { subject, courseNumber, semester, year, classNumber },
      context
    ) => {
      try {
        const userClassRatings = await getUserClassRatings(
          context,
          subject,
          courseNumber,
          semester,
          year,
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
      { subject, courseNumber, semester, year, classNumber, metricName, value },
      context
    ) => {
      try {
        return await createRating(
          context,
          subject,
          courseNumber,
          semester,
          year,
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
      { subject, courseNumber, semester, year, classNumber, metricName },
      context
    ) => {
      try {
        return await deleteRating(
          context,
          subject,
          courseNumber,
          semester,
          year,
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
