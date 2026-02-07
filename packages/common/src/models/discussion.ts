import mongoose, { Document, Schema } from "mongoose";

export interface IDiscussionItem {
  courseId: string;
  userId: mongoose.Types.ObjectId;
  comment: string;
}

export interface IDiscussionItemDocument extends IDiscussionItem, Document {}

const discussionSchema = new Schema<IDiscussionItem>(
  {
    courseId: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Index for querying comments by courseId
discussionSchema.index({ courseId: 1 });

// Index for querying comments by courseId and userId (for filtering)
discussionSchema.index({ courseId: 1, userId: 1 });

export const DiscussionModel = mongoose.model("discussions", discussionSchema);
