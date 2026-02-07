import type { CommentType } from "@repo/common/models";

export interface FormattedComment {
  id: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string | null;
  parentId: string | null;
  year: number;
  semester: string;
  subject: string;
  courseNumber: string;
  classNumber: string;
}

export interface FormattedClassComments {
  year: number;
  semester: string;
  subject: string;
  courseNumber: string;
  classNumber: string;
  comments: FormattedComment[];
}

export const formatComment = (doc: CommentType): FormattedComment => {
  const id = doc._id != null ? doc._id.toString() : "";
  return {
    id,
    body: doc.body,
    authorId: doc.authorId,
    authorName: doc.authorName,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : String(doc.createdAt),
    updatedAt:
      doc.updatedAt != null
        ? doc.updatedAt instanceof Date
          ? doc.updatedAt.toISOString()
          : String(doc.updatedAt)
        : null,
    parentId: doc.parentId?.toString() ?? null,
    year: doc.year,
    semester: doc.semester,
    subject: doc.subject,
    courseNumber: doc.courseNumber,
    classNumber: doc.classNumber,
  };
};

export const formatClassComments = (
  docs: CommentType[],
  year: number,
  semester: string,
  subject: string,
  courseNumber: string,
  classNumber: string
): FormattedClassComments => {
  return {
    year,
    semester,
    subject,
    courseNumber,
    classNumber,
    comments: docs.map(formatComment),
  };
};
