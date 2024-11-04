import mongoose, { InferSchemaType, Schema } from "mongoose";

const ratingSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    createdBy: {
      type: String,
      trim: true,
      required: true,
      immutable: true,
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
    metricName: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
      },
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

export const RatingModel = mongoose.model("rating", ratingSchema);
export type RatingType = InferSchemaType<typeof ratingSchema>;

const aggregatedMetricsSchema = new Schema({
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
  metricName: {
    type: String,
    required: true,
  },
  catgoryValue: {
    type: Number,
    required: true
  },
  categoryCount: {
    type: Number,
    required: true
  }
});

export const AggregatedMetricsModel = mongoose.model(
  "aggregatedMetrics",
  aggregatedMetricsSchema
);
export type AggregatedMetricsSchema = InferSchemaType<
  typeof aggregatedMetricsSchema
>;
