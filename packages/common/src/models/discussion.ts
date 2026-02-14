import mongoose, { Schema } from "mongoose";

export interface IDiscussionItem {
  _id: mongoose.Types.ObjectId;
  subject: string;
  courseNumber: string;
  userEmail: string;
  text: string;
  timestamp: Date;
}

const DiscussionSchema = new Schema<IDiscussionItem>(
  {
    subject: { type: String, required: true, index: true },
    courseNumber: { type: String, required: true, index: true },
    userEmail: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    collection: "discussions",
  }
);

// Compound index for efficient querying by course
DiscussionSchema.index({ subject: 1, courseNumber: 1, timestamp: -1 });

export const DiscussionModel = mongoose.model<IDiscussionItem>(
  "Discussion",
  DiscussionSchema
);