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
      const aggregatedRatings = await getClassAggregatedRatings(
        subject,
        courseNumber,
        semester,
        year,
        classNumber
      );
      return aggregatedRatings as unknown as RatingModule.AggregatedRatings;
    },

    userRatings: async (_, __, context) => {
      const userRatings = await getUserRatings(context);
      return userRatings as unknown as RatingModule.UserRatings;
    },

    userClassRatings: async (
      _,
      { subject, courseNumber, semester, year, classNumber },
      context
    ) => {
      const userClassRatings = await getUserClassRatings(
        context,
        subject,
        courseNumber,
        semester,
        year,
        classNumber
      );
      return userClassRatings as unknown as RatingModule.UserClass;
    },

    semestersWithRatings: async (
      _: unknown,
      { subject, courseNumber }: { subject: string; courseNumber: string }
    ) => {
      const semesters = await getSemestersWithRatings(subject, courseNumber);
      return semesters as unknown as RatingModule.SemesterRatings[];
    },
  },
  Mutation: {
    createRating: async (
      _,
      { subject, courseNumber, semester, year, classNumber, metricName, value },
      context
    ) => {
      return createRating(
        context,
        subject,
        courseNumber,
        semester,
        year,
        classNumber,
        metricName,
        value
      );
    },

    deleteRating: async (
      _,
      { subject, courseNumber, semester, year, classNumber, metricName },
      context
    ) => {
      return deleteRating(
        context,
        subject,
        courseNumber,
        semester,
        year,
        classNumber,
        metricName
      );
    },
  },
};

export default resolvers;
