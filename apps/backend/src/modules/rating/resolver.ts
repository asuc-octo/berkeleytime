import { 
  createRating, 
  getAggregatedRatings, 
  deleteRating,
  getUserRatings
} from "./controller";
import { RatingModule } from "./generated-types/module-types";

const resolvers: RatingModule.Resolvers = {
  Query: {
    aggregatedRatings: async (_, { classIdentifier, isAllTime }, __) => {
      const aggregatedRatings = await getAggregatedRatings(classIdentifier, isAllTime);
      return aggregatedRatings as unknown as RatingModule.AggregatedRatings;
    },
    userRatings: async (_, __, context) => {
      const userRatings = await getUserRatings(context);
      return userRatings as unknown as RatingModule.UserRatings;
    }
  },
  Mutation: {
    createRating: async (_, { rating, value }, context) => {
      const newRating = await createRating(context, rating, value);
      return newRating as unknown as RatingModule.AggregatedRatings;
    },
    deleteRating: async (_, { rating }, context) => {
      const deletedRating = await deleteRating(context, rating);
      return deletedRating as unknown as RatingModule.AggregatedRatings;
    }
  }
};

export default resolvers;
