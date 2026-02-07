import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

export const courseCommentSchema = new Schema(
  {
    courseId: {
      type: String,
      trim: true,
      required: true,
    },
    author: {
      type: String,
      trim: true,
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
    },
  }
);
courseCommentSchema.index({ courseId: 1 });

export const CourseCommentModel = mongoose.model(
  "courseComments",
  courseCommentSchema
);

export type CourseCommentType = Document &
  InferSchemaType<typeof courseCommentSchema>;
