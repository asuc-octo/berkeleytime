import { GraphQLError } from "graphql";

import { CourseModel, DiscussionModel } from "@repo/common/models";

import { formatCourseComment } from "./formatter";

export interface RequestContext {
  user?: {
    _id: string;
  };
}

const getCourseId = async (
  subject: string,
  courseNumber: string
): Promise<string | null> => {
  const course = await CourseModel.findOne({
    subject,
    number: courseNumber,
  }).select("courseId");

  return course?.courseId ?? null;
};

export const getCourseComments = async (
  subject: string,
  courseNumber: string,
  userId?: string | null
) => {
  const courseId = await getCourseId(subject, courseNumber);

  if (!courseId) {
    throw new GraphQLError(`Course not found: ${subject} ${courseNumber}`, {
      extensions: { code: "NOT_FOUND" },
    });
  }

  const filter: { courseId: string; createdBy?: string } = { courseId };
  if (userId) {
    filter.createdBy = userId;
  }

  const comments = await DiscussionModel.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  return comments.map((doc) => formatCourseComment(doc));
};

export const addCourseComment = async (
  context: RequestContext,
  subject: string,
  courseNumber: string,
  content: string
) => {
  if (!context?.user?._id) {
    throw new GraphQLError("You must be logged in to post a comment", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const createdBy = context.user._id;

  const contentTrimmed = content.trim();
  if (!contentTrimmed) {
    throw new GraphQLError("Comment content cannot be empty", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const courseId = await getCourseId(subject, courseNumber);

  if (!courseId) {
    throw new GraphQLError(`Course not found: ${subject} ${courseNumber}`, {
      extensions: { code: "NOT_FOUND" },
    });
  }

  const comment = await DiscussionModel.create({
    createdBy,
    courseId,
    content: contentTrimmed,
  });

  return formatCourseComment(comment.toObject());
};
