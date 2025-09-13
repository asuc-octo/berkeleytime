import { createComment, getDiscussion } from "./controller";
import { DiscussionModule } from "./generated-types/module-types";

const resolvers: DiscussionModule.Resolvers = {
  Query: {
    discussion: async (
      _,
      { subject, courseNumber, }
    ) => {
      return await getDiscussion(
        subject,
        courseNumber
      );
    },
  },
  Mutation: {
    createComment: async (
        _,
        { subject, courseNumber, comment },
        context,
    ) => {
        return await createComment(
            context,
            subject,
            courseNumber,
            comment,
        )
    }
  },
};

export default resolvers;
