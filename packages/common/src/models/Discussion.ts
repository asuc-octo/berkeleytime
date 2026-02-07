import mongoose, { InferSchemaType, Schema } from "mongoose";

const discussionSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    createdBy: {
      // comment author
      type: String,
      trim: true,
      required: true,
      immutable: true,
    },
    courseId: {
      // course identifier
      type: String,
      required: true,
    },
    content: {
      // comment content
      type: String,
      trim: true,
      required: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true, //createdAt + updatedAt
  }
);

// index for querying comments by courseID and recency
discussionSchema.index({ courseId: 1, createdAt: -1 });

// index for querying comments by courseID and author
discussionSchema.index({ courseId: 1, createdBy: 1 });

export const DiscussionModel = mongoose.model("discussion", discussionSchema);
export type DiscussionType = InferSchemaType<typeof discussionSchema>;
