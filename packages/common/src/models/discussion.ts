import { Model, Schema, model } from "mongoose";

export interface IDiscussionItem {
  email: string;
  courseNumber: string;
  createdAt: string;
  content: string;
}

const discussionSchema = new Schema<IDiscussionItem>({
  email: { type: String, required: true },
  courseNumber: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  content: { type: String, required: true },
});

discussionSchema.index({ courseNumber: 1 });

export const DiscussionModel: Model<IDiscussionItem> = model<IDiscussionItem>(
  "discussions",
  discussionSchema
);
