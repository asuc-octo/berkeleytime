import { IDiscussionItem, NewDiscussionModel } from "@repo/common";

import { formatDiscussion } from "./formatter";
import { GraphQLError } from "graphql";

export const getDiscussion = async (
  subject: string,
  courseNumber: string,
) => {
  const comments = await NewDiscussionModel.find({
    subject,
    courseNumber
  }).lean();

  if (!comments) return null;

  return comments.map((_comment) => formatDiscussion(_comment as IDiscussionItem));
};

export const createComment = async (
  context: RequestContext,
  subject: string,
  courseNumber: string,
  comment: string,
) => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  console.log(NewDiscussionModel);
  await NewDiscussionModel.create({
      ...{subject, courseNumber, comment},
      createdBy: context.user._id,
    });
  return true;
};

export interface RequestContext {
  user: {
    _id: string;
  };
}