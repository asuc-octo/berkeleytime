type CourseDiscussionLean = {
  _id: { toString: () => string };
  userId: { toString: () => string };
  courseId: string;
  comment: string;
  timestamp: Date;
};

export const formatCourseDiscussion = (doc: CourseDiscussionLean) => ({
  _id: doc._id.toString(),
  userId: doc.userId.toString(),
  courseId: doc.courseId,
  comment: doc.comment,
  timestamp: doc.timestamp,
});
