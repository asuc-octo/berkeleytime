import { GraphQLError } from "graphql";
import { createDiscussion, getDiscussionsByClass, getAllDiscussions, deleteDiscussion } from "./controller";
import { formatDiscussion, formatDiscussions } from "./formatter";

const resolvers = {
  Query: {
    discussionsByClass: async (_: any, { classId }: { classId: string }) => {
      try {
        const discussions = await getDiscussionsByClass(classId);
        return formatDiscussions(discussions);
      } catch (error: any) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError(error?.message ?? "An unexpected error occurred", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    allDiscussions: async () => {
      try {
        const discussions = await getAllDiscussions();
        return formatDiscussions(discussions);
      } catch (error: any) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError(error?.message ?? "An unexpected error occurred", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },

  Mutation: {
    createDiscussion: async (_: any, { content, author, classId }: { content: string; author: string; classId: string }) => {
      try {
        const doc = await createDiscussion(content, author, classId); // <-- awaited DB write
        return formatDiscussion(doc);
      } catch (error: any) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError(error?.message ?? "An unexpected error occurred", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    deleteDiscussion: async (_: any, { id }: { id: string }) => {
      try {
        return await deleteDiscussion(id); // <-- awaited DB delete
      } catch (error: any) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError(error?.message ?? "An unexpected error occurred", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};

export default resolvers;
