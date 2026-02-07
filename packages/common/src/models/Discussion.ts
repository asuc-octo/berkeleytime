import mongoose, { InferSchemaType, Schema } from "mongoose";

const commentSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true},
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
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: false,
    },
  }
);

commentSchema.index({ courseId: 1, createdAt: -1 });
commentSchema.index({ createdBy: 1, createdAt: -1 });

export const CommentModel = mongoose.model("comments", commentSchema);

export type CommentType = InferSchemaType<typeof commentSchema>;
