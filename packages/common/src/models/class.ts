import { Document, Model, Schema, model } from "mongoose";

export enum ClassGradingBasis {
  GRADED = "Graded",
  PASSED_NOT_PASSED = "Passed/Not Passed",
  SATISFACTORY_UNSATISFACTORY = "Satisfactory/Unsatisfactory",
}

export enum ClassFinalExam {
  NONE = "None",
  EXAM = "Exam",
}

export interface IClassItem {
  // course.identifiers[cs-course-id]
  courseId: string;
  courseNumber: string;
  year: number;
  semester: string;
  // session.term.id
  termId: string;
  // session.id
  sessionId: string;
  number: string;
  subject: string;
  offeringNumber?: number;
  // classTitle
  title?: string;
  // classDescription
  description?: string;
  allowedUnits?: {
    minimum?: number;
    maximum?: number;
    forAcademicProgress?: number;
    forFinancialAid?: number;
  };
  // gradingBasis.code
  gradingBasis?: string;
  // status.code
  status?: string;
  // finalExam.code
  finalExam?: string;
  // instructionMode.code
  instructionMode?: string;
  anyPrintInScheduleOfClasses?: boolean;
  contactHours?: number;
  // NOTE: Exclude if always the same as course blindGrading
  blindGrading?: boolean;
  // NOTE: Exclude if always the same as course requirementsFulfilled
  // requirementDesignation.code
  requirementDesignation?: {
    code?: string;
    description?: string;
    formalDescription?: string;
  };
  // requisites.description
  requisites?: string;
}

export interface IClassItemDocument extends IClassItem, Document {}

const classSchema = new Schema<IClassItem>({
  courseId: { type: String, required: true }, // course.identifiers[cs-course-id]
  courseNumber: { type: String, required: true },
  year: { type: Number, required: true },
  semester: { type: String, required: true },
  subject: { type: String, required: true },
  termId: { type: String, required: true }, // session.term.id
  sessionId: { type: String, required: true }, // session.id
  number: { type: String, required: true },
  offeringNumber: { type: Number },
  title: { type: String }, // classTitle
  description: { type: String }, // classDescription
  allowedUnits: {
    minimum: { type: Number },
    maximum: { type: Number },
    forAcademicProgress: { type: Number },
    forFinancialAid: { type: Number },
  },
  gradingBasis: { type: String }, // gradingBasis.code
  status: { type: String }, // status.code
  finalExam: { type: String }, // finalExam.code
  instructionMode: { type: String }, // instructionMode.code
  anyPrintInScheduleOfClasses: { type: Boolean },
  contactHours: { type: Number },
  blindGrading: { type: Boolean }, // NOTE: Exclude if always the same as course blindGrading
  requirementDesignation: {
    code: String,
    description: String,
    formalDescription: String,
  }, // NOTE: Exclude if always the same as course requirementsFulfilled, requirementDesignation.code
  requisites: { type: String }, // requisites.description
});
classSchema.index(
  {
    year: 1,
    semester: 1,
    sessionId: 1,
    subject: 1,
    courseNumber: 1,
    number: 1,
  },
  { unique: true }
);
classSchema.index({ courseId: 1 });

export const ClassModel: Model<IClassItem> = model<IClassItem>(
  "classes",
  classSchema
);
