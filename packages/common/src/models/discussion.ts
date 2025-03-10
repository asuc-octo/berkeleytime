// packages/../models/Discussion.ts – MongoDB schema
import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

//
export const discussionSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    timestamp: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt", // Automatically sets creation time
      updatedAt: "updatedAt",
    },
  }
);

export const DiscussionModel = mongoose.model("discussion", discussionSchema);

export type DiscussionType = Document &
  InferSchemaType<typeof discussionSchema>;
