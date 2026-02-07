import { CommentWithTimestamps } from "./controller";
import { DiscussionModule } from "./generated-types/module-types";

export const formatComment = (
  comment: CommentWithTimestamps
): DiscussionModule.Comment => {
  return {
    _id: comment._id.toString(),
    courseId: comment.courseId,
    userId: comment.userId.toString(),
    comment: comment.comment,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  };
};
