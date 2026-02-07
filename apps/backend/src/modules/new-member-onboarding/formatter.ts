import { Types } from "mongoose";

import { DiscussionType } from "@repo/common/models";

/**
 * Format a discussion comment from the database model to GraphQL type
 */
export const formatCourseComment = (
  comment: DiscussionType & {
    _id?: Types.ObjectId | null;
    createdAt?: Date;
    updatedAt?: Date;
  }
) => {
  return {
    id: comment._id?.toString() ?? "",
    courseId: comment.courseId,
    subject: comment.subject,
    courseNumber: comment.courseNumber,
    userId: comment.userId,
    text: comment.text,
    createdAt: comment.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: comment.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
};
