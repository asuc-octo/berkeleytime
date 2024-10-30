import { 
    getRating,
    getUserRatings,
    createRating
} from "./controller";

import { RatingModule } from "./generated-types/module-types";

const resolvers: RatingModule.Resolvers = {
    Query: {
        rating: async (_, { name: name, subject: subject, number: number }) => {
            const ratingSummary = await getRating(name, subject, number);
            return ratingSummary as RatingModule.RatingSummary;
        },
        user_ratings: async (_, { subject: subject, number: number }, context) => {
            const ratings = await getUserRatings(context, subject, number);
            return ratings as RatingModule.Rating[];
        }
    },
    Mutation: {
        createRating: async(_, { rating }, context) => {
            const ratingSummary = await createRating(rating, context);
            return ratingSummary as RatingModule.RatingSummary;
        },
        deleteRating: async(_, { subject: subject, number: number }, context) => {
            const ratingSummary = await deleteRating(subject, number, context);
            return ratingSummary as RatingModule.RatingSummary;
        }
    }
}

export default resolvers;