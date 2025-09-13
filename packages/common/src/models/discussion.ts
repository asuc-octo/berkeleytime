import mongoose, { InferSchemaType, Schema } from "mongoose";

const commentSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
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
    value: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CommentModel = mongoose.model("comment", commentSchema);
export type CommentType = InferSchemaType<typeof commentSchema>;
/*
const aggregatedCommentSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
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
  categoryValue: {
    type: Number,
    required: true,
  },
  categoryCount: {
    type: Number,
    required: true,
  },
});

export const AggregatedMetricsModel = mongoose.model(
  "aggregatedMetrics",
  aggregatedMetricsSchema
);
export type AggregatedMetricsSchema = InferSchemaType<
  typeof aggregatedMetricsSchema
>;
*/