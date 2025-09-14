import { Document, Model, Schema, model } from "mongoose";

export interface Comment {
  userId: string;
  comment: string;
  timestamp: string;
}

export interface IDiscussionItem {
  courseSubject: string;
  courseNumber: string;

  comments: Comment[];
}

export interface IDiscussionItemDocument extends IDiscussionItem, Document {}

const discussionSchema = new Schema<IDiscussionItem>({
  courseSubject: { type: String, required: true },
  courseNumber: { type: String, required: true },

  comments: [
    {
      userId: { type: String, required: true },
      comment: { type: String, required: true },
      timestamp: { type: String, required: true },
    },
  ],
});

export const DiscussionModel: Model<IDiscussionItem> = model<IDiscussionItem>(
  "discussion", 
  discussionSchema
);