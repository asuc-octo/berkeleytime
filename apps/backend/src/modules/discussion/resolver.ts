import { GraphQLError } from "graphql";

import { createComment, getComments } from "./controller";
import { DiscussionModule } from "./generated-types/module-types";

const resolvers: DiscussionModule.Resolvers = {
  Query: {
    comments: async (_, { courseId }) => {
      try {
        const comments = await getComments(courseId);
        return comments as unknown as DiscussionModule.Comment[];
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
    createComment: async (_, { courseId, text }, context) => {
      try {
        return await createComment(context, courseId, text);
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
