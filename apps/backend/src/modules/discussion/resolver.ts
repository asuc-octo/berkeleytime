import { GraphQLError } from "graphql";

import { getComments, postComment } from "./controller";
import { DiscussionModule } from "./generated-types/module-types";

const resolvers: DiscussionModule.Resolvers = {
  Query: {
    getComments: async (_, { subject, courseNumber, userEmail }) => {
      try {
        return await getComments(subject, courseNumber, userEmail);
      } catch (error) {
        console.error("Error fetching comments:", error);
        throw new GraphQLError("Failed to fetch comments");
      }
    },
  },
  Mutation: {
    postComment: async (_, { subject, courseNumber, text }, context) => {
      // Get user email from context (assumes authentication middleware)
      const userEmail = context.user?.email;

      if (!userEmail) {
        throw new GraphQLError("Authentication required", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      if (!text.trim()) {
        throw new GraphQLError("Comment text cannot be empty", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      try {
        return await postComment(subject, courseNumber, text.trim(), userEmail);
      } catch (error) {
        console.error("Error posting comment:", error);
        throw new GraphQLError("Failed to post comment");
      }
    },
  },
};

export default resolvers;