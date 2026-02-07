import { GraphQLError } from "graphql";

import { RequestContext } from "../../types/request-context";
import { addComment, getComments } from "./controller";
import { formatComment } from "./formatter";
import { DiscussionModule } from "./generated-types/module-types";

const resolvers: DiscussionModule.Resolvers = {
  Query: {
    comments: async (
      _,
      { courseId, userId }
    ): Promise<DiscussionModule.Comment[]> => {
      const comments = await getComments(courseId, userId ?? undefined);

      return comments.map(formatComment);
    },
  },

  Mutation: {
    addComment: async (
      _,
      { courseId, comment },
      context: RequestContext
    ): Promise<DiscussionModule.Comment> => {
      if (!context.user?._id) {
        throw new GraphQLError("Authentication required", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const newComment = await addComment(courseId, context.user._id, comment);

      return formatComment(newComment);
    },
  },
};

export default resolvers;
