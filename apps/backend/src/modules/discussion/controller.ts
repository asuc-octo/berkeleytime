import mongoose from "mongoose";

import { DiscussionModel, IDiscussionItem } from "@repo/common/models";

export type CommentWithTimestamps = IDiscussionItem & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const getComments = async (
  courseId: string,
  userId?: string
): Promise<CommentWithTimestamps[]> => {
  const query: {
    courseId: string;
    userId?: mongoose.Types.ObjectId;
  } = { courseId };

  if (userId) {
    query.userId = new mongoose.Types.ObjectId(userId);
  }

  const comments = await DiscussionModel.find(query)
    .sort({ createdAt: -1 })
    .lean();

  return comments as unknown as CommentWithTimestamps[];
};

export const addComment = async (
  courseId: string,
  userId: string,
  comment: string
): Promise<CommentWithTimestamps> => {
  const newComment = new DiscussionModel({
    courseId,
    userId,
    comment,
  });

  const savedComment = await newComment.save();

  return savedComment.toObject() as unknown as CommentWithTimestamps;
};
