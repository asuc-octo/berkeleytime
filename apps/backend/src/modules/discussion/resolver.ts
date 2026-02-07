import { addCourseDiscussion, getCourseDiscussions } from "./controller";

const resolvers = {
  Query: {
    courseDiscussions: async (_: unknown, { courseId }: { courseId: string }) =>
      getCourseDiscussions(courseId),
  },

  Mutation: {
    addCourseDiscussion: async (
      _: unknown,
      { courseId, comment }: { courseId: string; comment: string },
      context: { user: { _id: string; isAuthenticated: boolean } }
    ) => addCourseDiscussion(context, courseId, comment),
  },
};

export default resolvers;
