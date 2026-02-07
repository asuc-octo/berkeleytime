/**
 * Intermediate format with author as user ID string.
 * The CourseComment.author resolver resolves this to User.
 */
export interface IntermediateCourseComment {
  _id: string;
  courseId: string;
  author: string;
  content: string;
  createdAt: string;
}

interface CourseCommentInput {
  _id: unknown;
  courseId: string;
  author: string;
  content: string;
  createdAt?: Date | string;
}

export function formatCourseComment(comment: CourseCommentInput): IntermediateCourseComment {
  const createdAt =
    comment.createdAt instanceof Date
      ? comment.createdAt.toISOString()
      : typeof comment.createdAt === "string"
        ? comment.createdAt
        : new Date().toISOString();

  return {
    _id: String(comment._id),
    courseId: comment.courseId,
    author: comment.author,
    content: comment.content,
    createdAt,
  };
}
