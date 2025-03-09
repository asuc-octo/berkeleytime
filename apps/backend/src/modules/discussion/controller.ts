// discussion/controller.ts – Business logic
import { DiscussionModel } from "@repo/common";
import { formatDiscussion } from "./formatter";

export const addDiscussion = async (
  courseId: string,
  text: string,
  userId: string
) => {
  if (!text || text.trim().length === 0)
    throw new Error("Discussion text cannot be empty");

  const newDiscussion = new DiscussionModel({
    course: courseId,
    text,
    user: userId,
    timestamp: new Date().toISOString(),
  });

  await newDiscussion.save();

  return newDiscussion;
};

export const getDiscussionsByCourse = async (courseId: string) => {
  if (!courseId) throw new Error("Course ID is required");

  const Discussions = await DiscussionModel.find({ course: courseId }).sort({
    timestamp: -1,
  });

  return Discussions.map(formatDiscussion);
};

export const filterDiscussionsByUser = async (userId: string) => {
  if (!userId) throw new Error("User ID is required");

  const discussions = await DiscussionModel.find({ user: userId });

  return discussions.map(formatDiscussion);
};
