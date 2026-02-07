import { GraphQLError } from "graphql";

import { DiscussionModel } from "@repo/common/models";

export interface DiscussionRequestContext {
  user: {
    _id: string;
  };
}

export const getCourseComments = async (courseId: string, userId?: string) => {
  const filter = userId ? { courseId, createdBy: userId } : { courseId };
  return DiscussionModel.find(filter).sort({ createdAt: -1 }).lean();
};

export const addCourseComment = async (
  context: DiscussionRequestContext,
  courseId: string,
  body: string
) => {
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

  return comment.toObject();
};
