import { Types } from "mongoose";

import { DiscussionType } from "@repo/common/models";

import { DiscussionModule } from "./generated-types/module-types";

export type FormattedDiscussionComment = DiscussionModule.DiscussionComment & {
  _id: string;
};

const formatTimestamp = (value?: Date) => {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return new Date().toISOString();
};

export const formatDiscussionComment = (
  comment: DiscussionType
): FormattedDiscussionComment => {
  const id = (comment._id as Types.ObjectId).toString();
  return {
    _id: id,
    id,
    courseId: comment.courseId,
    subject: comment.subject,
    courseNumber: comment.courseNumber,
    createdBy: comment.createdBy,
    comment: comment.comment,
    createdAt: formatTimestamp(comment.createdAt),
    updatedAt: formatTimestamp(comment.updatedAt),
  };
};
