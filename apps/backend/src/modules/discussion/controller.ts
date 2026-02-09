import { GraphQLError } from "graphql";

import { CourseCommentModel } from "@repo/common/models";

import { RequestContext } from "../../types/request-context";
import { formatCourseComment } from "./formatter";

export const getCourseComments = async (courseId: string) => {
  const comments = await CourseCommentModel.find({ courseId })
    .sort({ createdAt: 1 })
    .lean();

  return comments.map((comment) => formatCourseComment(comment));
};

export const addCourseComment = async (
  context: RequestContext,
  courseId: string,
  content: string
) => {
  if (!context.user?._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const comment = await CourseCommentModel.create({
    courseId,
    author: context.user._id,
    content,
  });

  return formatCourseComment(comment.toObject());
};
