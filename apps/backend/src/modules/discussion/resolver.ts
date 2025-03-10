// discussion/resolver.ts – Connects GraphQL to controllers
import {
  addDiscussion,
  filterDiscussionsByUser,
  getDiscussionsByCourse,
} from "./controller";

// import { IntermediateDiscussion } from "./formatter";

const resolvers = {
  Query: {
    getDiscussionsByCourse: async (
      _: any,
      { courseId }: { courseId: string }
    ) => {
      const discussions = await getDiscussionsByCourse(courseId);
      return discussions;
    },
    filterDiscussionsByUser: async (_: any, { userId }: { userId: string }) => {
      const discussions = await filterDiscussionsByUser(userId);
      return discussions;
    },
  },
  Mutation: {
    addDiscussion: async (
      _: any,
      { courseId, text }: { courseId: string; text: string },
      context: any
    ) => {
      const newDiscussion = await addDiscussion(courseId, text, context);
      return newDiscussion;
    },
  },
};

export default resolvers;
