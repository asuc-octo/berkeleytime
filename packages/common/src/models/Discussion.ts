import mongoose, { InferSchemaType, Schema } from "mongoose";

const discussionSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    courseId: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
      immutable: true,
    },
    body: {
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
discussionSchema.index({ courseId: 1, createdBy: 1 });

export const DiscussionModel = mongoose.model("discussion", discussionSchema);
export type DiscussionType = InferSchemaType<typeof discussionSchema>;
