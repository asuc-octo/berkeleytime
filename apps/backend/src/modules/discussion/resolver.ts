import {
  addCourseDiscussion,
  getCourseDiscussions,
} from "./controller";
import { formatCourseDiscussion } from "./formatter";

const resolvers = {
  Query: {
    courseDiscussions: async (
      _: unknown,
      { courseId }: { courseId: string }
    ) => {
      const discussions = await getCourseDiscussions(courseId);
      return discussions.map(formatCourseDiscussion);
    },
  },

  Mutation: {
    addCourseDiscussion: async (
      _: unknown,
      { courseId, comment }: { courseId: string; comment: string },
      context: { user: { _id: string; isAuthenticated: boolean } }
    ) => {
      const doc = await addCourseDiscussion(context, courseId, comment);
      return formatCourseDiscussion(doc);
    },
  },
};

export default resolvers;
