import { GraphQLError } from "graphql";

import { CourseModel, DiscussionModel } from "@repo/common/models";

import type { FormattedDiscussionComment } from "./formatter";
import { formatDiscussionComment } from "./formatter";

export interface DiscussionRequestContext {
  user?: {
    _id?: string;
  };
}

export const getCourseComments = async (
  courseId: string,
  userId?: string | null
): Promise<FormattedDiscussionComment[]> => {
  const course = await CourseModel.findOne({ courseId }).select("courseId");
  if (!course) {
    throw new GraphQLError(`Course not found: ${courseId}`, {
      extensions: { code: "NOT_FOUND" },
    });
  }

  const filter: { courseId: string; createdBy?: string } = { courseId };
  if (userId != null && userId !== "") {
    filter.createdBy = userId;
  }

  const comments = await DiscussionModel.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  return comments.map((doc) => {
    const _id = doc._id;
    if (!_id)
      throw new GraphQLError("Comment missing _id", {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    return formatDiscussionComment({
      ...doc,
      _id,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    } as Parameters<typeof formatDiscussionComment>[0]);
  });
};

export const addCourseComment = async (
  context: DiscussionRequestContext,
  courseId: string,
  body: string
): Promise<FormattedDiscussionComment> => {
  if (!context.user?._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const course = await CourseModel.findOne({ courseId }).select("courseId");
  if (!course) {
    throw new GraphQLError(`Course not found: ${courseId}`, {
      extensions: { code: "NOT_FOUND" },
    });
  }

  const trimmedBody = body?.trim() ?? "";
  if (!trimmedBody) {
    throw new GraphQLError("Comment body cannot be empty", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const doc = await DiscussionModel.create({
    courseId,
    createdBy: context.user._id,
    body: trimmedBody,
  });

  const _id = doc._id;
  if (!_id)
    throw new GraphQLError("Comment missing _id", {
      extensions: { code: "INTERNAL_SERVER_ERROR" },
    });
  return formatDiscussionComment({
    ...doc.toObject(),
    _id,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  } as Parameters<typeof formatDiscussionComment>[0]);
};
