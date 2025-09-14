import mongoose, { Document, Schema } from "mongoose";

export interface IDiscussionItem {
  discussionId: string;
  classId: string;
  userId: string;
  content: string;
  timestamp: Date;
  parentId?: string;
}

export interface IDiscussionItemDocument extends IDiscussionItem, Document {}

const discussionSchema = new Schema<IDiscussionItem>({
  discussionId: { type: String, required: true, unique: true },
  classId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  parentId: { type: String, required: false },
});

discussionSchema.index({ classId: 1, timestamp: -1 });
discussionSchema.index({ userId: 1, timestamp: -1 });
discussionSchema.index({ discussionId: 1 }, { unique: true });

export const DiscussionModel =
  mongoose.models.discussions ||
  mongoose.model("discussions", discussionSchema);
