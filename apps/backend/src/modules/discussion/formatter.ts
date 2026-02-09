import type { DiscussionType } from "@repo/common/models";

export interface FormattedDiscussionComment {
  id: string;
  courseId: string;
  createdBy: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export const formatDiscussionComment = (
  doc: DiscussionType & {
    _id: { toString(): string };
    createdAt?: Date;
    updatedAt?: Date;
  }
): FormattedDiscussionComment => {
  return {
    id: doc._id.toString(),
    courseId: doc.courseId,
    createdBy: doc.createdBy,
    body: doc.body,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : new Date().toISOString(),
    updatedAt:
      doc.updatedAt instanceof Date
        ? doc.updatedAt.toISOString()
        : new Date().toISOString(),
  };
};
