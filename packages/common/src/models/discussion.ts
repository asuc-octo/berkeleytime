import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

export const commentSchema = new Schema(
  {
    createdBy: {
      type: String,
      required: true,
    },
    courseNumber: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: false,
    },
  },
  {
    timestamps: true,
  }
);

export const CommentModel = mongoose.model("Comment", commentSchema);
export type CommentType = Document & InferSchemaType<typeof commentSchema>;
