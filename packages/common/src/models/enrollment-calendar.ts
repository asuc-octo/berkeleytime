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
    rrule: {
      type: String,
      required: false,
      trim: true,
    },
    categories: {
      type: [String],
      required: false,
      default: [],
    },
    sequence: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      required: false,
      trim: true,
      enum: ["CONFIRMED", "TENTATIVE", "CANCELLED", null],
    },
    parsedEvent: {
      type: {
        termCode: { type: String, required: true, trim: true },
        semester: {
          type: String,
          required: true,
          enum: ["Spring", "Fall", "Summer"],
        },
        year: { type: Number, required: true },
        phase: { type: Number, enum: [1, 2, null], default: null },
        isAdjustment: { type: Boolean, required: true, default: false },
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
        eventType: {
          type: String,
          required: true,
          enum: ["start", "end"],
        },
      },
      required: false,
      default: null,
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
enrollmentCalendarEventSchema.index({
  "parsedEvent.termCode": 1,
  "parsedEvent.phase": 1,
  "parsedEvent.group": 1,
  "parsedEvent.eventType": 1,
});

export type EnrollmentCalendarEventType = Document &
  InferSchemaType<typeof enrollmentCalendarEventSchema>;

export const EnrollmentCalendarEventModel = mongoose.model(
  "EnrollmentCalendar",
  enrollmentCalendarEventSchema
);
