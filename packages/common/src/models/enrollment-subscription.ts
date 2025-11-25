import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

import { SEMESTER_ENUM } from "../lib/common";

const enrollmentSubscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    year: {
      type: Number,
      required: true,
    },
    semester: {
      type: String,
      enum: SEMESTER_ENUM,
      required: true,
    },
    sessionId: {
      type: String,
      required: false,
      default: "1",
    },
    subject: {
      type: String,
      required: true,
    },
    courseNumber: {
      type: String,
      required: true,
    },
    sectionNumber: {
      type: String,
      required: true,
    },
    thresholds: {
      type: [Number],
      required: true,
      default: [],
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

// Prevent duplicate subscriptions for the same user/class combination.
enrollmentSubscriptionSchema.index(
  {
    userId: 1,
    year: 1,
    semester: 1,
    sessionId: 1,
    subject: 1,
    courseNumber: 1,
    sectionNumber: 1,
  },
  { unique: true }
);

// Support lookup by class during alert fan-out.
enrollmentSubscriptionSchema.index({
  year: 1,
  semester: 1,
  sessionId: 1,
  subject: 1,
  courseNumber: 1,
  sectionNumber: 1,
  thresholds: 1,
});

export const EnrollmentSubscriptionModel = mongoose.model(
  "enrollment_subscriptions",
  enrollmentSubscriptionSchema
);

export type EnrollmentSubscriptionType = Document &
  InferSchemaType<typeof enrollmentSubscriptionSchema>;
