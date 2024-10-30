import { Document, Schema, model } from "mongoose";

export interface IClassItem {
  // course.identifiers[cs-course-id]
  courseId: string;
  // session.term.id
  termId: string;
  // session.id
  sessionId: string;
  number: string;
  offeringNumber: number;
  // classTitle
  title: string;
  // classDescription
  description: string;
  allowedUnits: {
    minimum: number;
    maximum: number;
    forAcademicProgress: number;
    forFinancialAid: number;
  };
  // gradingBasis.code
  gradingBasis: string;
  // status.code
  status: string;
  // finalExam.code
  finalExam: string;
  // instructionMode.code
  instructionMode: string;
  anyPrintInScheduleOfClasses: boolean;
  contactHours: number;
  // NOTE: Exclude if always the same as course blindGrading
  blindGrading: boolean;
  // NOTE: Exclude if always the same as course requirementsFulfilled
  // requirementDesignation.code
  requirementDesignation: string;
  // requisites.description
  requisites: string;
}

export interface IClassItemDocument extends IClassItem, Document {}

const classSchema = new Schema<IClassItem>({
  courseId: { type: String, required: true },
  termId: { type: String, required: true },
  sessionId: { type: String, required: true },
  number: { type: String, required: true },
  offeringNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  allowedUnits: {
    minimum: { type: Number, required: true },
    maximum: { type: Number, required: true },
    forAcademicProgress: { type: Number, required: true },
    forFinancialAid: { type: Number, required: true },
  },
  gradingBasis: { type: String, required: true },
  status: { type: String, required: true },
  finalExam: { type: String, required: true },
  instructionMode: { type: String, required: true },
  anyPrintInScheduleOfClasses: { type: Boolean, required: true },
  contactHours: { type: Number, required: true },
  blindGrading: { type: Boolean, required: true },
  requirementDesignation: { type: String, required: true },
  requisites: { type: String, required: true },
});

export const NewClassModel = model<IClassItem>("NewClass", classSchema);
