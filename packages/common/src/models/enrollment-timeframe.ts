import mongoose, { Document, InferSchemaType, Model, Schema } from "mongoose";

export const enrollmentTimeframeSchema = new Schema(
  {
    termId: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    semester: {
      type: String,
      required: true,
      enum: ["Spring", "Fall", "Summer"],
    },
    phase: {
      type: Number,
      enum: [1, 2, null],
      default: null,
    },
    isAdjustment: {
      type: Boolean,
      required: true,
      default: false,
    },
    group: {
      type: String,
      required: true,
      enum: [
        "continuing",
        "new_transfer",
        "new_freshman",
        "new_graduate",
        "new_student",
        "all",
      ],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: false,
    },
    startEventUid: {
      type: String,
      required: false,
      trim: true,
    },
    startEventSummary: {
      type: String,
      required: false,
      trim: true,
    },
    endEventUid: {
      type: String,
      required: false,
      trim: true,
    },
    endEventSummary: {
      type: String,
      required: false,
      trim: true,
    },
    lastSyncedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
    collection: "enrollmenttimeframes",
  }
);

// Unique constraint on term + phase + group combination
enrollmentTimeframeSchema.index(
  { termId: 1, phase: 1, isAdjustment: 1, group: 1 },
  { unique: true }
);

// Index for querying by year and semester
enrollmentTimeframeSchema.index({ year: 1, semester: 1 });

export type EnrollmentTimeframeType = Document &
  InferSchemaType<typeof enrollmentTimeframeSchema>;

export const EnrollmentTimeframeModel: Model<EnrollmentTimeframeType> =
  mongoose.model<EnrollmentTimeframeType>(
    "EnrollmentTimeframe",
    enrollmentTimeframeSchema
  );
