import { DiscussionModel, IDiscussionItem, Comment } from "@repo/common";
import { formatDiscussion } from "./formatter";

export const getDiscussion = async (courseSubject: string, courseNumber: string) => {
  const discussion = await DiscussionModel.findOne({ courseSubject, courseNumber }).lean();
  if (!discussion) return null;
  const formattedDiscussion = formatDiscussion(discussion as IDiscussionItem);
  return formattedDiscussion;
}

export const createComment = async (courseSubject: string, courseNumber: string, userId: string, comment: string, timestamp: string) => {
  const newComment: Comment = {
    userId,
    comment,
    timestamp
  }

  const discussion = await DiscussionModel.findOneAndUpdate(
    { courseSubject, courseNumber },
    { $push: { comments: newComment } },
    { new: true, upsert: true }
  );

  const formattedDiscussion = formatDiscussion(discussion as IDiscussionItem);
  return formattedDiscussion;
}