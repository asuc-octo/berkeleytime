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
    // New canonical identifiers
    classId: {
      type: Schema.Types.ObjectId,
      ref: "class",
      required: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    // Legacy fields - kept for backward compatibility during migration
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
  // New canonical identifiers
  classId: {
    type: Schema.Types.ObjectId,
    ref: "class",
    required: true,
  },
  courseId: {
    type: String,
    required: true,
  },
  // Legacy fields - kept for backward compatibility during migration
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

// New indexes using courseId for cross-listing support
// CLASS-level queries (most specific) - using classId
aggregatedMetricsSchema.index(
  {
    classId: 1,
    metricName: 1,
    categoryValue: 1,
  },
  { unique: true }
);

// COURSE-level queries (all classes across all semesters, unified cross-listings)
aggregatedMetricsSchema.index({
  courseId: 1,
});

// Legacy indexes - kept for migration compatibility
// CLASS-level queries (most specific)
aggregatedMetricsSchema.index(
  {
    subject: 1,
    courseNumber: 1,
    semester: 1,
    year: 1,
    classNumber: 1,
    metricName: 1,
    categoryValue: 1,
  },
  { unique: false } // Changed from unique to allow new unique index on classId
);

// TERM-level queries (group all classes in a semester)
aggregatedMetricsSchema.index({
  subject: 1,
  courseNumber: 1,
  semester: 1,
  year: 1,
});

// COURSE-level queries (group all classes across all semesters)
aggregatedMetricsSchema.index({
  subject: 1,
  courseNumber: 1,
});

export const AggregatedMetricsModel = mongoose.model(
  "aggregatedMetrics",
  aggregatedMetricsSchema
);
export type AggregatedMetricsSchema = InferSchemaType<
  typeof aggregatedMetricsSchema
>;
