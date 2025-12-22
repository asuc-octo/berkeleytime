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
    timestamps: true,
  }
);

export const RatingModel = mongoose.model("rating", ratingSchema);
export type RatingType = InferSchemaType<typeof ratingSchema>;

const aggregatedMetricsSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
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
  metricName: {
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

// Unique constraint per class/metric/value combination
aggregatedMetricsSchema.index(
  { classId: 1, metricName: 1, categoryValue: 1 },
  { unique: true }
);

// Course-level queries (unified cross-listings)
aggregatedMetricsSchema.index({ courseId: 1 });

// Term-level queries
aggregatedMetricsSchema.index({
  subject: 1,
  courseNumber: 1,
  semester: 1,
  year: 1,
});

export const AggregatedMetricsModel = mongoose.model(
  "aggregatedMetrics",
  aggregatedMetricsSchema
);
export type AggregatedMetricsSchema = InferSchemaType<
  typeof aggregatedMetricsSchema
>;
