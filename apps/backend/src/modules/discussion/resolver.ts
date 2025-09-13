import { createComment, getAggregatedComments } from "./controller";
import { DiscussionModule } from "./generated-types/module-types";

const resolvers: DiscussionModule.Resolvers = {
  Query: {
    aggregatedComments: async (_, _arguments, context) => {
      // args: { year, semester, subject, courseNumber, classNumber }
      const aggregated = await getAggregatedComments(context, _arguments);
      return aggregated as unknown as DiscussionModule.AggregatedComments;
    },
  },


  Mutation: {
    createComment: async (_, _arguments, context) => {
      const comment = await createComment(context, _arguments);
      return comment;
    },
  },
};

export default resolvers;