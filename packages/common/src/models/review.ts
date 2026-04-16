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
    reviewTitle: {
      type: String,
      required: false,
    },
    reviewContent: {
      type: String,
      required: false,
    },
    reviewerGrade: {
      type: String,
      required: false,
      default: "n/a",
    },
    valid: {
      type: Boolean,
      required: true,
      default: true,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    helpfulVoters: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Only one currently valid review per user per course.
// Historical invalid reviews are preserved for soft-delete behavior.
reviewSchema.index(
  { createdBy: 1, courseId: 1 },
  { unique: true, partialFilterExpression: { valid: true } }
);

export const ReviewModel = mongoose.model("review", reviewSchema);
export type ReviewType = InferSchemaType<typeof reviewSchema>;
