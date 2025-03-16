import { CommentModel } from "@repo/common";

//import { Types } from "mongoose";
import { formatDiscussion } from "./formatter";

//import mongoose from "mongoose";

export const getComments = async (courseNumber: string, createdBy?: string) => {
  try {
    console.log("createdBy:", createdBy);
    const filter: any = { courseNumber };
    if (createdBy) {
      filter.createdBy = createdBy;
    }
    const discussion = await CommentModel.find(filter).sort({ timestamp: -1 });
    return discussion.map(formatDiscussion);
  } catch (error) {
    throw new Error("Error");
  }
};

export const addComment = async (
  //context: any,
  courseNumber: string,
  text: string,
  createdBy: string
) => {
  const comment = await CommentModel.create({
    courseNumber: courseNumber,
    text: text,
    createdBy: createdBy,
    timestamp: new Date(),
  });

  return await formatDiscussion(comment);
};
