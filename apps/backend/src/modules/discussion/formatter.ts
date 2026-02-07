import { Types } from "mongoose";

import { DiscussionType } from "@repo/common/models";

export interface FormattedDiscussionComment {
  _id: string;
  courseId: string;
  subject: string;
  courseNumber: string;
  createdBy: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

const formatTimestamp = (value?: Date) => {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return new Date().toISOString();
};

export const formatDiscussionComment = (
  comment: DiscussionType
): FormattedDiscussionComment => {
  return {
    _id: (comment._id as Types.ObjectId).toString(),
    courseId: comment.courseId,
    subject: comment.subject,
    courseNumber: comment.courseNumber,
    createdBy: comment.createdBy,
    comment: comment.comment,
    createdAt: formatTimestamp(comment.createdAt),
    updatedAt: formatTimestamp(comment.updatedAt),
  };
};
