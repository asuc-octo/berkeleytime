import { DiscussionModel, IDiscussionItem } from "@repo/common/models";

import { formatComment } from "./formatter";
import { DiscussionModule } from "./generated-types/module-types";

/**
 * Retrieve all comments for a specific course
 * Optionally filter by user email
 */
export const getComments = async (
  subject: string,
  courseNumber: string,
  userEmail?: string | null
): Promise<DiscussionModule.Comment[]> => {
  const query: {
    subject: string;
    courseNumber: string;
    userEmail?: string;
  } = {
    subject,
    courseNumber,
  };

  // Add user filter if provided
  if (userEmail) {
    query.userEmail = userEmail;
  }

  const comments = await DiscussionModel.find(query)
    .sort({ timestamp: -1 }) // Most recent first
    .lean<IDiscussionItem[]>();

  return comments.map(formatComment);
};

/**
 * Add a new comment for a course
 */
export const postComment = async (
  subject: string,
  courseNumber: string,
  text: string,
  userEmail: string
): Promise<DiscussionModule.Comment> => {
  const comment = await DiscussionModel.create({
    subject,
    courseNumber,
    userEmail,
    text,
    timestamp: new Date(),
  });

  return formatComment(comment.toObject());
};