import { DiscussionController } from "./controller";
import { DiscussionFormatter } from "./formatter";
import { DiscussionModule } from "./generated-types/module-types";

const discussionController = new DiscussionController();

const resolvers: DiscussionModule.Resolvers = {
  Query: {
    discussionComments: async (_, { filter, limit, offset }) => {
      try {
        const comments = await discussionController.getComments(
          filter || {},
          { limit: limit || undefined, offset: offset || undefined }
        );

        return comments.map(c => DiscussionFormatter.formatComment(c));
      } catch (error) {
        console.error("Error fetching discussion comments:", error);
        throw new Error("Failed to fetch discussion comments");
      }
    },
  },

  Mutation: {
    createDiscussionComment: async (_, { input }, context) => {
      try {
        const userId = context.user?._id;
        if (!userId) {
          throw new Error("Authentication required to create comments");
        }

        const savedComment = await discussionController.createComment(input, userId);
        return DiscussionFormatter.formatComment(savedComment);
      } catch (error) {
        console.error("Error creating discussion comment:", error);
        throw error;
      }
    },
  },
};

export default resolvers;
