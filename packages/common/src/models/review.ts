import mongoose, { InferSchemaType, Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    createdBy: {
      type: String,
      trim: true,
      required: true,
      immutable: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "class",
      required: true,
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
    semester: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    classNumber: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Unique review per user per course
reviewSchema.index({ createdBy: 1, courseId: 1 }, { unique: true });

export const ReviewModel = mongoose.model("review", reviewSchema);
export type ReviewType = InferSchemaType<typeof reviewSchema>;
