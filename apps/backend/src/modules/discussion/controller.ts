import { GraphQLError } from "graphql";

import { ClassModel, CommentModel, UserModel } from "@repo/common/models";

import { Semester } from "../../generated-types/graphql";
import { RequestContext } from "../../types/request-context";

const findClassOrThrow = async (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  classNumber: string
) => {
  const classDoc = await ClassModel.findOne({
    year,
    semester,
    subject,
    courseNumber,
    number: classNumber,
  });

  if (!classDoc) {
    throw new GraphQLError(
      `Class not found: ${subject} ${courseNumber} ${semester} ${year} #${classNumber}`,
      { extensions: { code: "NOT_FOUND" } }
    );
  }

  return classDoc;
};

export const getCommentsForClass = async (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  classNumber: string
) => {
  const comments = await CommentModel.find({
    year,
    semester,
    subject,
    courseNumber,
    classNumber,
  })
    .sort({ createdAt: 1 })
    .lean();

  return comments;
};

export const createComment = async (
  context: RequestContext,
  input: {
    body: string;
    year: number;
    semester: Semester;
    subject: string;
    courseNumber: string;
    classNumber: string;
    parentId?: string | null;
  }
) => {
  if (!context.user?._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const classDoc = await findClassOrThrow(
    input.year,
    input.semester,
    input.subject,
    input.courseNumber,
    input.classNumber
  );

  const user = await UserModel.findById(context.user._id).select("name").lean();
  const authorName = user?.name ?? "Unknown";

  const doc = await CommentModel.create({
    body: input.body,
    authorId: context.user._id,
    authorName,
    classId: classDoc._id,
    courseId: classDoc.courseId,
    subject: input.subject,
    courseNumber: input.courseNumber,
    semester: input.semester,
    year: input.year,
    classNumber: input.classNumber,
    ...(input.parentId && { parentId: input.parentId }),
  });

  return doc;
};

export const deleteComment = async (
  context: RequestContext,
  id: string
): Promise<boolean> => {
  if (!context.user?._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const comment = await CommentModel.findOne({
    _id: id,
    authorId: context.user._id,
  });

  if (!comment) {
    throw new GraphQLError("Comment not found or you are not the author", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  await CommentModel.deleteOne({ _id: id });
  return true;
};
