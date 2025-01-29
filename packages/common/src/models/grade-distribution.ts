import mongoose, { Document, Schema } from "mongoose";

export interface IGradeDistributionItem {
  // Identifiers
  courseId: string;
  subject: string;
  courseNumber: string;
  courseOfferingNumber: number;
  termId: string;
  sessionId: string;

  // TODO: CCN?
  classNumber: string;
  sectionNumber: string;

  // Grade distribution
  count: number;
  distinct: number;

  countAPlus: number;
  countA: number;
  countAMinus: number;
  countBPlus: number;
  countB: number;
  countBMinus: number;
  countCPlus: number;
  countC: number;
  countCMinus: number;
  countDPlus: number;
  countD: number;
  countDMinus: number;
  countF: number;
  countP: number;
  countNP: number;
  countS: number;
  countU: number;
  countCR: number;
  countNC: number;
  countHH: number;
  countH: number;
  countPC: number;
}

export interface IGradeDistributionItemDocument
  extends IGradeDistributionItem,
    Document {}

const gradeDistributionSchema = new Schema<IGradeDistributionItem>(
  {
    courseId: { type: String, required: true },
    subject: { type: String, required: true },
    courseNumber: { type: String, required: true },
    courseOfferingNumber: { type: Number, required: true },

    termId: { type: String, required: true },
    sessionId: { type: String, required: true },

    classNumber: { type: String, required: true },
    sectionNumber: { type: String, required: true },

    count: { type: Number, required: true },
    distinct: { type: Number, required: true },

    countAPlus: { type: Number, default: 0 },
    countA: { type: Number, default: 0 },
    countAMinus: { type: Number, default: 0 },
    countBPlus: { type: Number, default: 0 },
    countB: { type: Number, default: 0 },
    countBMinus: { type: Number, default: 0 },
    countCPlus: { type: Number, default: 0 },
    countC: { type: Number, default: 0 },
    countCMinus: { type: Number, default: 0 },
    countDPlus: { type: Number, default: 0 },
    countD: { type: Number, default: 0 },
    countDMinus: { type: Number, default: 0 },
    countF: { type: Number, default: 0 },
    countP: { type: Number, default: 0 },
    countNP: { type: Number, default: 0 },
    countS: { type: Number, default: 0 },
    countU: { type: Number, default: 0 },
    countCR: { type: Number, default: 0 },
    countNC: { type: Number, default: 0 },
    countHH: { type: Number, default: 0 },
    countH: { type: Number, default: 0 },
    countPC: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);
gradeDistributionSchema.index(
  { termId: 1, classNumber: 1, sectionNumber: 1 },
  { unique: true }
);

export const GradeDistributionModel = mongoose.model(
  "GradeDistributions",
  gradeDistributionSchema
);
