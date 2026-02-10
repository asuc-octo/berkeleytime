interface CommentSource {
  _id?: { toString: () => string } | null;
  id?: string;
  courseId: string;
  createdBy: string;
  body: string;
  createdAt?: Date | string;
}

export const formatComment = (comment: CommentSource) => ({
  id: comment.id ?? comment._id?.toString() ?? "",
  courseId: comment.courseId,
  createdBy: comment.createdBy,
  body: comment.body,
  createdAt:
    comment.createdAt instanceof Date
      ? comment.createdAt.toISOString()
      : (comment.createdAt ?? new Date().toISOString()),
});
