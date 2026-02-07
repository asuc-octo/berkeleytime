import { GraphQLError } from "graphql";

import { CourseModel, DiscussionModel } from "@repo/common/models";

export interface RequestContext {
  user: {
    _id: string;
  };
}

/**
 * Get the courseId for a given subject and courseNumber
 */
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

/**
 * Retrieve all comments for a specific course
 * Optionally filter by userId
 */
export const getCourseComments = async (
  subject: string,
  courseNumber: string,
  userId?: string
) => {
  // Build the query filter
  const filter: {
    subject: string;
    courseNumber: string;
    userId?: string;
  } = {
    subject,
    courseNumber,
  };

  // Add userId filter if provided (extra pod points feature!)
  if (userId) {
    filter.userId = userId;
  }

  // Query the database and sort by newest first
  const comments = await DiscussionModel.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  return comments;
};

/**
 * Add a new comment for a course
 */
export const addCourseComment = async (
  context: RequestContext,
  subject: string,
  courseNumber: string,
  text: string
) => {
  // Check if user is authenticated
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  // Validate that text is not empty
  if (!text || text.trim().length === 0) {
    throw new GraphQLError("Comment text cannot be empty", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  // Get the courseId (for cross-listing support)
  const courseId = await getCourseId(subject, courseNumber);
  if (!courseId) {
    throw new GraphQLError(`Course not found: ${subject} ${courseNumber}`, {
      extensions: { code: "NOT_FOUND" },
    });
  }

  // Create the comment
  const comment = await DiscussionModel.create({
    courseId,
    subject,
    courseNumber,
    userId: context.user._id,
    text: text.trim(),
  });

  return comment;
};
