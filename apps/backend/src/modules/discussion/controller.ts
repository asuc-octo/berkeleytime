import { GraphQLError } from "graphql";

import { CourseDiscussionModel } from "@repo/common/models";

import { formatCourseDiscussion } from "./formatter";

export interface DiscussionRequestContext {
  user: {
    _id: string;
  };
}

export const getCourseDiscussions = async (courseId: string) => {
  const discussions = await CourseDiscussionModel.find({ courseId })
    .sort({ timestamp: -1 })
    .lean();

  return discussions.map(formatCourseDiscussion);
};

export const addCourseDiscussion = async (
  context: DiscussionRequestContext,
  courseId: string,
  comment: string
) => {
  if (!context.user?._id) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const doc = await CourseDiscussionModel.create({
    userId: context.user._id,
    courseId,
    comment,
  });

  return formatCourseDiscussion(doc);
};
