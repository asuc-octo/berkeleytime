import { Document, Schema, model } from "mongoose";

import { descriptor } from "../lib/sis";

/*
 * The term schema is used to store information about the academic term, such as
 * the academic year, begin date, end date, and deadlines for various actions.
 * https://developers.api.berkeley.edu/api/232/interactive-docs
 */

// TODO: WORK IN PROGRESS
export interface ITermItem {
  academicCareer: typeof descriptor;
  temporalPosition: "Previous" | "Current" | "Next" | "Past" | "Future";
  id: string;
  name: string;
  category: typeof descriptor;
  academicYear: string;
  beginDate: string;
  endDate: string;
  weeksOfInstruction: number;
  holidaySchedule: string;
  censusDate: string;
  fullyEnrolledDeadline: string;
  fullyGradedDeadline: string;
  cancelDeadline: string;
  withdrawNoPenaltyDeadline: string;
  degreeConferDate: string;
  selfServicePlanBeginDate: string;
  selfServicePlanEndDate: string;
  selfServiceEnrollBeginDate: string;
  selfServiceEnrollEndDate: string;
  sessions: {
    temporalPosition: "Previous" | "Current" | "Next" | "Past" | "Future";
    id: string;
    name: string;
    beginDate: string;
    endDate: string;
    weeksOfInstruction: number;
    holidaySchedule: string;
    censusDate: string;
    sixtyPercentPoint: string;
    openEnrollmentDate: string;
    enrollBeginDate: string;
    enrollEndDate: string;
    waitlistEndDate: string;
    fullyEnrolledDeadline: string;
    dropDeletedFromRecordDeadline: string;
    dropRetainOnRecordDeadline: string;
    dropWithPenaltyDeadline: string;
    cancelDeadline: string;
    withdrawNoPenaltyDeadline: string;
    withdrawWithPenaltyDeadline: string;
    timePeriods: {
      period: string;
      endDate: string;
    }[];
  }[];
}

export interface ITermItemDocument extends ITermItem, Document {}

const termSchema = new Schema<ITermItem>({
  academicCareer: { type: String, required: true },
  temporalPosition: {
    type: String,
    enum: ["Previous", "Current", "Next", "Past", "Future"],
    required: true,
  },
  id: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  academicYear: { type: String, required: true },
  beginDate: { type: String, required: true },
  endDate: { type: String, required: true },
  weeksOfInstruction: { type: Number, required: true },
  holidaySchedule: { type: String, required: true },
  censusDate: { type: String, required: true },
  fullyEnrolledDeadline: { type: String, required: true },
  fullyGradedDeadline: { type: String, required: true },
  cancelDeadline: { type: String, required: true },
  withdrawNoPenaltyDeadline: { type: String, required: true },
  degreeConferDate: { type: String, required: true },
  selfServicePlanBeginDate: { type: String, required: true },
  selfServicePlanEndDate: { type: String, required: true },
  selfServiceEnrollBeginDate: { type: String, required: true },
  selfServiceEnrollEndDate: { type: String, required: true },
  sessions: {
    type: [
      {
        temporalPosition: {
          type: String,
          enum: ["Previous", "Current", "Next", "Past", "Future"],
          required: true,
        },
        id: { type: String, required: true },
        name: { type: String, required: true },
        beginDate: { type: String, required: true },
        endDate: { type: String, required: true },
        weeksOfInstruction: { type: Number, required: true },
        holidaySchedule: { type: String, required: true },
        censusDate: { type: String, required: true },
        sixtyPercentPoint: { type: String, required: true },
        openEnrollmentDate: { type: String, required: true },
        enrollBeginDate: { type: String, required: true },
        enrollEndDate: { type: String, required: true },
        waitlistEndDate: { type: String, required: true },
        fullyEnrolledDeadline: { type: String, required: true },
        dropDeletedFromRecordDeadline: { type: String, required: true },
        dropRetainOnRecordDeadline: { type: String, required: true },
        dropWithPenaltyDeadline: { type: String, required: true },
        cancelDeadline: { type: String, required: true },
        withdrawNoPenaltyDeadline: { type: String, required: true },
        withdrawWithPenaltyDeadline: { type: String, required: true },
        timePeriods: {
          type: [
            {
              period: { type: String, required: true },
              endDate: { type: String, required: true },
            },
          ],
          required: true,
        },
      },
    ],
    required: true,
  },
});
termSchema.index({ id: 1 }, { unique: true });

export const NewTermModel = model<ITermItem>("NewTerm", termSchema);
