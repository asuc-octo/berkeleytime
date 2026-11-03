import mongoose, { Document, InferSchemaType, Model, Schema } from "mongoose";

// One document per term, recording when the enrollments puller last ran
// successfully. Unchanged sections are not written on each run; instead the
// last history entry of each section is treated as lasting until lastPulledAt.
export const enrollmentPullSchema = new Schema(
  {
    termId: {
      type: String,
      required: true,
      trim: true,
    },
    lastPulledAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "enrollmentpulls",
  }
);

enrollmentPullSchema.index({ termId: 1 }, { unique: true });

export type EnrollmentPullType = Document &
  InferSchemaType<typeof enrollmentPullSchema>;

export const EnrollmentPullModel: Model<EnrollmentPullType> =
  mongoose.model<EnrollmentPullType>("EnrollmentPull", enrollmentPullSchema);
