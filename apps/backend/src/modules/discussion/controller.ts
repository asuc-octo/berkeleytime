import { GraphQLError } from "graphql";

import { DiscussionModel } from "@repo/common/models";

export interface DiscussionRequestContext {
  user: {
    _id: string;
  };
}

const normalizeCommentId = <T extends { _id?: unknown | null }>(comment: T) => ({
  ...comment,
  _id: comment._id ?? undefined,
});

export const getCourseComments = async (courseId: string, userId?: string) => {
  try {
    const filter = userId ? { courseId, createdBy: userId } : { courseId };
    const comments = await DiscussionModel.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    return comments.map((comment) => normalizeCommentId(comment));
  } catch (error: unknown) {
    if (error instanceof GraphQLError) {
      throw error;
    }
    throw new GraphQLError(
      typeof error === "object" && error !== null && "message" in error
        ? String(error.message)
        : "An unexpected error occurred",
      {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      }
    );
  }
};

export const addCourseComment = async (
  context: DiscussionRequestContext,
  courseId: string,
  body: string
) => {
  try {
    if (!context.user?._id) {
      throw new GraphQLError("Unauthorized", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    const comment = await DiscussionModel.create({
      courseId,
      createdBy: context.user._id,
      body,
    });

    return normalizeCommentId(comment.toObject());
  } catch (error: unknown) {
    if (error instanceof GraphQLError) {
      throw error;
    }
    throw new GraphQLError(
      typeof error === "object" && error !== null && "message" in error
        ? String(error.message)
        : "An unexpected error occurred",
      {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      }
    );
  }
};
