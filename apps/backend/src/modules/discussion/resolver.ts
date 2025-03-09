import { getDiscussions, addDiscussion } from "./controller";
import { DiscussionModule } from "./generated-types/module-types";

const resolvers: DiscussionModule.Resolvers = {
  Query: {
    discussions: async (
      _: any,
      { courseNumber, email }: { courseNumber: string; email?: string | null }
    ) => {
      return getDiscussions(courseNumber, email ?? undefined);
    },
  },
  Mutation: {
    addDiscussion: async (
      _: any,
      { courseNumber, email, content }: { courseNumber: string; email: string; content: string }
    ) => {
      return addDiscussion(courseNumber, email, content);
    },
  },
};

export default resolvers;

