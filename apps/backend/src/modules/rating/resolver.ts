import {
  createRating,
  deleteRating,
  getAggregatedRatings,
  getSemestersWithRatings,
  getUserRatings,
} from "./controller";
import { RatingModule } from "./generated-types/module-types";

const resolvers: RatingModule.Resolvers = {
  Query: {
    aggregatedRatings: async (
      _,
      { subject, courseNumber, semester, year, classNumber, isAllTime },
      __
    ) => {
      const aggregatedRatings = await getAggregatedRatings(
        subject,
        courseNumber,
        semester,
        year,
        classNumber,
        isAllTime
      );
      return aggregatedRatings as unknown as RatingModule.AggregatedRatings;
    },

    userRatings: async (_, __, context) => {
      const userRatings = await getUserRatings(context);
      return userRatings as unknown as RatingModule.UserRatings;
    },

    semestersWithRatings: async (_, { subject, courseNumber }, __) => {
      const semesters = await getSemestersWithRatings(subject, courseNumber);
      return semesters as unknown as RatingModule.SemesterAvailable[];
    },
  },
  Mutation: {
    createRating: async (
      _,
      { subject, courseNumber, semester, year, classNumber, metricName, value },
      context
    ) => {
      const newRating = await createRating(
        context,
        subject,
        courseNumber,
        semester,
        year,
        classNumber,
        metricName,
        value
      );
      return newRating as unknown as RatingModule.AggregatedRatings;
    },

    deleteRating: async (
      _,
      { subject, courseNumber, semester, year, classNumber, metricName },
      context
    ) => {
      const deletedRating = await deleteRating(
        context,
        subject,
        courseNumber,
        semester,
        year,
        classNumber,
        metricName
      );
      return deletedRating as unknown as boolean;
    },
  },
};

export default resolvers;