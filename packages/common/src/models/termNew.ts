import { Schema, model } from "mongoose";

/*
 * The term schema is used to store information about the academic term, such as
 * the academic year, begin date, end date, and deadlines for various actions.
 * https://developers.api.berkeley.edu/api/232/interactive-docs
 */

// TODO: WORK IN PROGRESS
export interface ITermItem {
  academicCareerCode: string;
  temporalPosition: "Current" | "Past" | "Future";
  id: string;
  name: string;
  academicYear: string;
  beginDate: string;
  endDate: string;
  weeksOfInstruction?: number;
  holidayScheduleCode?: string;
  censusDate?: string;
  fullyEnrolledDeadline?: string;
  fullyGradedDeadline?: string;
  cancelDeadline?: string;
  withdrawNoPenaltyDeadline?: string;
  degreeConferDate?: string;
  selfServicePlanBeginDate?: string;
  selfServicePlanEndDate?: string;
  selfServiceEnrollBeginDate?: string;
  selfServiceEnrollEndDate?: string;
  sessions?: {
    temporalPosition: "Current" | "Past" | "Future";
    id: string;
    name: string;
    beginDate: string;
    endDate: string;
    weeksOfInstruction?: number;
    holidayScheduleCode?: string;
    censusDate?: string;
    sixtyPercentPoint?: string;
    openEnrollmentDate?: string;
    enrollBeginDate?: string;
    enrollEndDate?: string;
    waitListEndDate?: string;
    fullyEnrolledDeadline?: string;
    dropDeletedFromRecordDeadline?: string;
    dropRetainedOnRecordDeadline?: string;
    dropWithPenaltyDeadline?: string;
    cancelDeadline?: string;
    withdrawNoPenaltyDeadline?: string;
    withdrawWithPenaltyDeadline?: string;
    timePeriods?: {
      periodDescription: string;
      endDate: string;
    }[];
  }[];
}

const termSchema = new Schema<ITermItem>({
  academicCareerCode: { type: String, required: true },
  temporalPosition: {
    type: String,
    enum: ["Current", "Past", "Future"],
    required: true,
  },
  id: { type: String, required: true },
  name: { type: String, required: true },
  academicYear: { type: String, required: true },
  beginDate: { type: String, required: true },
  endDate: { type: String, required: true },
  weeksOfInstruction: { type: Number },
  holidayScheduleCode: { type: String },
  censusDate: { type: String },
  fullyEnrolledDeadline: { type: String },
  fullyGradedDeadline: { type: String },
  cancelDeadline: { type: String },
  withdrawNoPenaltyDeadline: { type: String },
  degreeConferDate: { type: String },
  selfServicePlanBeginDate: { type: String },
  selfServicePlanEndDate: { type: String },
  selfServiceEnrollBeginDate: { type: String },
  selfServiceEnrollEndDate: { type: String },
  sessions: {
    type: [
      {
        temporalPosition: {
          type: String,
          enum: ["Previous", "Current", "Next", "Past", "Future"],
          required: true
        },
        id: { type: String, required: true },
        name: { type: String, required: true },
        beginDate: { type: String, required: true },
        endDate: { type: String, required: true },
        weeksOfInstruction: { type: Number },
        holidayScheduleCode: { type: String },
        censusDate: { type: String },
        sixtyPercentPoint: { type: String },
        openEnrollmentDate: { type: String },
        enrollBeginDate: { type: String },
        enrollEndDate: { type: String },
        waitListEndDate: { type: String },
        fullyEnrolledDeadline: { type: String },
        dropDeletedFromRecordDeadline: { type: String },
        dropRetainedOnRecordDeadline: { type: String },
        dropWithPenaltyDeadline: { type: String },
        cancelDeadline: { type: String },
        withdrawNoPenaltyDeadline: { type: String },
        withdrawWithPenaltyDeadline: { type: String },
        timePeriods: {
          type: [
            {
              periodDescription: { type: String, required: true },
              endDate: { type: String, required: true },
            },
          ],
        },
      },
    ],
  },
});
termSchema.index({ id: 1, academicCareerCode: 1 }, { unique: true });

export const NewTermModel = model<ITermItem>("NewTerm", termSchema);
