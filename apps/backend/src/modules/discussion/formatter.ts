import { Types } from "mongoose";

export const formatComment = (comment: any) => ({
  id: comment._id.toString(),
  courseId: comment.courseId,
  userId: comment.userId,
  content: comment.content,
  createdAt: comment.createdAt.toISOString(),
});

export const formatComments = (comments: any[]) =>
  comments.map(formatComment);
