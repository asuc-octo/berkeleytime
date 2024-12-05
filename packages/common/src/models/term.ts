import mongoose, { InferSchemaType, Schema } from "mongoose";

import { schemaOptions } from "../lib/common";
import { descriptor } from "../lib/sis";

const temporalPosition = {
  type: String,
  enum: ["Previous", "Current", "Next", "Future", "Past"],
};

export const semester = {
  type: String,
  enum: ["Spring", "Summer", "Fall", "Winter"],
};

export const sessionSchema = new Schema(
  {
    temporalPosition,
    id: String,
    name: {
      type: String,
      required: true,
    },
    beginDate: Date,
    endDate: Date,
    weeksOfInstruction: Number,
    holidaySchedule: descriptor,
    censusDate: Date,
    sixtyPercentPoint: Date,
    openEnrollmentDate: Date,
    enrollBeginDate: Date,
    enrollEndDate: Date,
    waitlistEndDate: Date,
    fullyEnrolledDeadline: Date,
    dropDeletedFromRecordDeadline: Date,
    dropRetainOnRecordDeadline: Date,
    dropWithPenaltyDeadline: Date,
    cancelDeadline: Date,
    withdrawNoPenaltyDeadline: Date,
    withdrawWithPenaltyDeadline: Date,
    timePeriods: [
      {
        period: {
          type: Object,
          required: true,
          properties: descriptor,
        },
        endDate: Date,
      },
    ],
  },
  schemaOptions
);

/*
 * The term schema is used to store information about the academic term, such as
 * the academic year, begin date, end date, and deadlines for various actions.
 * https://developers.api.berkeley.edu/api/232/interactive-docs
 */
const termSchema = new Schema(
  {
    academicCareer: descriptor,
    temporalPosition,
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: Object,
      required: true,
      properties: descriptor,
    },
    academicYear: {
      type: String,
      required: true,
    },
    beginDate: Date,
    endDate: Date,
    weeksOfInstruction: Number,
    holidaySchedule: descriptor,
    censusDate: Date,
    fullyEnrolledDeadline: Date,
    fullyGradedDeadline: Date,
    cancelDeadline: Date,
    withdrawNoPenaltyDeadline: Date,
    degreeConferDate: Date,
    selfServicePlanBeginDate: Date,
    selfServicePlanEndDate: Date,
    selfServiceEnrollBeginDate: Date,
    selfServiceEnrollEndDate: Date,
    sessions: [sessionSchema],
  },
  schemaOptions
);

export const TermModel = mongoose.model("Term", termSchema);

export type TermType = InferSchemaType<typeof termSchema>;

export type SessionType = InferSchemaType<typeof sessionSchema>;
