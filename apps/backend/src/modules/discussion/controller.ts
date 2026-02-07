import { GraphQLError } from "graphql";

import { CourseModel, DiscussionModel } from "@repo/common/models";

import { formatDiscussionComment } from "./formatter";

export interface DiscussionRequestContext {
  user: {
    _id?: string;
    isAuthenticated?: boolean;
  };
}

export interface CreateCourseCommentInput {
  subject: string;
  courseNumber: string;
  comment: string;
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

const normalizeFilterUser = (createdBy?: string | null) => {
  const trimmed = createdBy?.trim();
  return trimmed ? trimmed : null;
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

  const filterUser = normalizeFilterUser(createdBy);
  const query: Record<string, unknown> = { courseId };
  if (filterUser) {
    query.createdBy = filterUser;
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
  input: CreateCourseCommentInput
) => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const subject = input.subject.trim();
  const courseNumber = input.courseNumber.trim();
  const commentBody = input.comment.trim();

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
