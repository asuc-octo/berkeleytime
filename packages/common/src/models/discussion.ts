import mongoose, { InferSchemaType, Schema } from "mongoose";

const discussionSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    createdBy: {
      type: String,
      trim: true,
      required: true,
      immutable: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    courseNumber: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

discussionSchema.index({ courseId: 1, createdAt: -1 });
discussionSchema.index({ subject: 1, courseNumber: 1, createdAt: -1 });
discussionSchema.index({ createdBy: 1, createdAt: -1 });

export const DiscussionModel = mongoose.model("discussion", discussionSchema);
export type DiscussionType = InferSchemaType<typeof discussionSchema>;
