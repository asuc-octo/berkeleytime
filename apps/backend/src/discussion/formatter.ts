import type { DiscussionType } from "@repo/common/models";

export interface CourseCommentOutput { //converted MongoDB document to GQL shape (output)
  id: string;
  createdBy: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const formatCourseComment = ( //converts MongoDB document to GQL shape (input)
  doc: DiscussionType & { _id: unknown; createdAt?: Date; updatedAt?: Date }
): CourseCommentOutput => {
  const createdAt =
    doc.createdAt instanceof Date
      ? doc.createdAt.toISOString()
      : doc.createdAt
        ? new Date(doc.createdAt).toISOString()
        : new Date().toISOString();

  const updatedAt =
    doc.updatedAt instanceof Date
      ? doc.updatedAt.toISOString()
      : doc.updatedAt
        ? new Date(doc.updatedAt).toISOString()
        : createdAt;

  return {
    id: String(doc._id),
    content: doc.content,
    createdBy: doc.createdBy,
    createdAt,
    updatedAt,
  };
};
