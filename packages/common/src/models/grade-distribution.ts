import mongoose, { InferSchemaType, Schema } from "mongoose";

const gradeDistributionSchema = new Schema(
  {
    // Identifiers
    courseId: { type: String, required: true },
    subject: { type: String, required: true },
    courseNumber: { type: String, required: true },
    courseOfferingNumber: { type: Number, required: true },

    termId: { type: String, required: true },
    session: { type: String, required: true },

    // TODO: CCN?
    classNumber: { type: String, required: true },
    sectionNumber: { type: String, required: true },

    // Grade distribution
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

export const GradeDistributionModel = mongoose.model(
  "gradeDistribution",
  gradeDistributionSchema,
  "grade-distributions"
);

export type GradeDistributionType = InferSchemaType<
  typeof gradeDistributionSchema
>;
