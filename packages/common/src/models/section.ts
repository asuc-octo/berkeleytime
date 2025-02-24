import { Document, Model, Schema, model } from "mongoose";

export interface ISectionItem {
  courseId: string;
  classNumber: string;
  sessionId: string;
  termId: string;
  sectionId: string;
  number: string;
  subject: string;
  courseNumber: string;
  year: number;
  semester: string;
  component?: string;
  status?: string;
  instructionMode?: string;
  printInScheduleOfClasses?: boolean;
  graded?: boolean;
  feesExist?: boolean;
  startDate?: string;
  endDate?: string;
  addConsentRequired?: string;
  dropConsentRequired?: string;
  primary?: boolean;
  type?: string;
  combinedSections?: number[];
  exams?: {
    date?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    number?: number;
    type?: string;
  }[];
  meetings?: {
    number?: number;
    days?: boolean[];
    startTime?: string;
    endTime?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    instructors?: {
      printInScheduleOfClasses?: boolean;
      familyName?: string;
      givenName?: string;
      role?: string;
    }[];
  }[];
}

export interface ISectionItemDocument extends ISectionItem, Document {}

const sectionSchema = new Schema<ISectionItem>({
  // identifiers
  termId: { type: String, required: true },
  sessionId: { type: String, required: true },
  sectionId: { type: String, required: true },

  // relationships
  courseId: { type: String, required: true },
  classNumber: { type: String, required: true },
  subject: { type: String, required: true },
  courseNumber: { type: String, required: true },
  number: { type: String, required: true },
  primary: { type: Boolean },

  // attributes
  year: { type: Number, required: true },
  semester: { type: String, required: true },
  component: { type: String },
  status: { type: String },
  instructionMode: { type: String },
  printInScheduleOfClasses: { type: Boolean },
  graded: { type: Boolean },
  feesExist: { type: Boolean },
  startDate: { type: String },
  endDate: { type: String },
  addConsentRequired: { type: String },
  dropConsentRequired: { type: String },
  type: { type: String },
  combinedSections: { type: [Number] },
  exams: [
    {
      date: { type: String },
      startTime: { type: String },
      endTime: { type: String },
      location: { type: String },
      number: { type: Number },
      type: { type: String },
    },
  ],
  meetings: [
    {
      number: { type: Number },
      days: { type: [Boolean] },
      startTime: { type: String },
      endTime: { type: String },
      startDate: { type: String },
      endDate: { type: String },
      location: { type: String },
      instructors: [
        {
          printInScheduleOfClasses: { type: Boolean },
          familyName: { type: String },
          givenName: { type: String },
          role: { type: String },
        },
      ],
    },
  ],
});
sectionSchema.index(
  { termId: 1, sessionId: 1, sectionId: 1 },
  { unique: true }
);
sectionSchema.index(
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

export const SectionModel: Model<ISectionItem> = model<ISectionItem>(
  "Section",
  sectionSchema
);
