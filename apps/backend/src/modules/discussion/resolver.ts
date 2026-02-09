import { DiscussionController } from "./controller";
import { formatComment, formatComments } from "./formatter";

export const discussionResolvers = {
  Query: {
    courseComments: async (
      _: any,
      { courseId, userId }: { courseId: string; userId?: string }
    ) => {
      const comments =
        await DiscussionController.getCommentsForCourse(
          courseId,
          userId
        );

      return formatComments(comments);
    },
  },

  Mutation: {
    addCourseComment: async (
      _: any,
      { courseId, content }: { courseId: string; content: string },
      context: any
    ) => {
      // Usually comes from auth middleware
      const userId = context.user.id;

      const comment =
        await DiscussionController.addComment(
          courseId,
          userId,
          content
        );

      return formatComment(comment);
    },
  },
};



export default discussionResolvers;
