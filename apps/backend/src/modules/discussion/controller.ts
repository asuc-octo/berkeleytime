import { GraphQLError } from "graphql";

import { CourseModel, DiscussionModel } from "@repo/common/models";

import { formatDiscussionComment } from "./formatter";

export interface DiscussionRequestContext {
  user: {
    _id?: string;
    isAuthenticated?: boolean;
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
  createdBy?: string | null
) => {
  const courseId = await getCourseId(subject, courseNumber);
  if (!courseId) {
    return [];
  }

  const query: Record<string, unknown> = { courseId };
  if (createdBy) {
    query.createdBy = createdBy;
  }

  const comments = await DiscussionModel.find(query)
    .sort({ createdAt: -1 })
    .lean();

  return comments.map((comment) =>
    formatDiscussionComment(
      comment as Parameters<typeof formatDiscussionComment>[0]
    )
  );
};

export const createCourseComment = async (
  context: DiscussionRequestContext,
  subject: string,
  courseNumber: string,
  commentBody: string
) => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  if (!subject || !courseNumber) {
    throw new GraphQLError("Course identifier is required", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  if (!commentBody) {
    throw new GraphQLError("Comment cannot be empty", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const courseId = await getCourseId(subject, courseNumber);
  if (!courseId) {
    throw new GraphQLError("Course not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  const comment = await DiscussionModel.create({
    createdBy: context.user._id,
    courseId,
    subject,
    courseNumber,
    comment: commentBody,
  });

  return formatDiscussionComment(comment.toObject());
};
