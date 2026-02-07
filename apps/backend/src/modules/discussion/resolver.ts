import { getUserById } from "../user/controller";

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

  CourseDiscussion: {
    user: (parent: { userId: string }) => getUserById(parent.userId),
  },
};

export default resolvers;
