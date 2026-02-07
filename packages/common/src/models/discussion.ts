import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

const courseDiscussionSchema = new Schema(
  {
    timestamp: { type: Date, required: true, default: Date.now },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: String, required: true },
    comment: { type: String, required: true },
  },
  { _id: true }
);

export const CourseDiscussionModel = mongoose.model(
  "CourseDiscussion",
  courseDiscussionSchema
);

export type CourseDiscussionType = Document &
  InferSchemaType<typeof courseDiscussionSchema>;
