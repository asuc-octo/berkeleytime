import type { DiscussionType } from "@repo/common/models";

export interface CourseCommentOutput {
  //converted MongoDB document to GQL shape (output)
  id: string;
  createdBy: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const formatCourseComment = (
  //converts MongoDB document to GQL shape (input)
  doc: DiscussionType & { _id: unknown; createdAt?: Date; updatedAt?: Date }
): CourseCommentOutput => {
  const createdAt = new Date(doc.createdAt ?? Date.now()).toISOString();
  const updatedAt = new Date(doc.updatedAt ?? doc.createdAt ?? Date.now()).toISOString();

  return {
    id: String(doc._id),
    content: doc.content,
    createdBy: doc.createdBy,
    createdAt,
    updatedAt,
  };
};
