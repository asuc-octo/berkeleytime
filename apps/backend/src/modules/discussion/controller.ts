import { GraphQLError } from "graphql";

import { CommentModel } from "@repo/common/models";

export interface RequestContext {
  user: {
    _id: string;
  };
}

/**
 * Get all comments for a specific course
 */
export const getComments = async (courseId: string) => {
  try {
    const comments = await CommentModel.find({ courseId })
      .sort({ createdAt: -1 })
      .lean();

    return comments;
  } catch (error) {
    throw new GraphQLError("Failed to fetch comments", {
      extensions: { code: "INTERNAL_SERVER_ERROR" },
    });
  }
};

/**
 * Create a new comment for a course
 */
export const createComment = async (
  context: RequestContext,
  courseId: string,
  text: string
): Promise<boolean> => {
  // Check authentication
  if (!context.user?._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  // Validate inputs
  if (!text || text.trim().length === 0) {
    throw new GraphQLError("Comment text cannot be empty", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  if (text.length > 2000) {
    throw new GraphQLError(
      "Comment text exceeds maximum length of 2000 characters",
      {
        extensions: { code: "BAD_USER_INPUT" },
      }
    );
  }

  try {
    // Create new comment in MongoDB
    await CommentModel.create({
      courseId,
      createdBy: context.user._id,
      text: text.trim(),
    });

    return true;
  } catch (error) {
    throw new GraphQLError("Failed to create comment", {
      extensions: { code: "INTERNAL_SERVER_ERROR" },
    });
  }
};
