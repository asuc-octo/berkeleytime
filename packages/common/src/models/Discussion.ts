import mongoose, { InferSchemaType, Schema } from "mongoose";

const discussionSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
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
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Index for efficient queries by course
discussionSchema.index({ subject: 1, courseNumber: 1 });
discussionSchema.index({ courseId: 1 });

// Index for filtering by user (extra pod points feature)
discussionSchema.index({ userId: 1 });

// Compound index for filtering comments by course and user
discussionSchema.index({ subject: 1, courseNumber: 1, userId: 1 });

export const DiscussionModel = mongoose.model("discussion", discussionSchema);
export type DiscussionType = InferSchemaType<typeof discussionSchema>;
