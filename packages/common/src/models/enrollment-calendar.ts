import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

export const enrollmentCalendarEventSchema = new Schema(
  {
    uid: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: false,
    },
    endDate: {
      type: Date,
      required: false,
    },
    location: {
      type: String,
      required: false,
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
    source: {
      type: String,
      required: true,
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
    collection: "enrollmentcalendar",
  }
);

enrollmentCalendarEventSchema.index({ uid: 1 }, { unique: true });

export type EnrollmentCalendarEventType = Document &
  InferSchemaType<typeof enrollmentCalendarEventSchema>;

export const EnrollmentCalendarEventModel = mongoose.model(
  "EnrollmentCalendar",
  enrollmentCalendarEventSchema
);
