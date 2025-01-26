import { Document, Model, Schema, model } from "mongoose";

export interface ISectionItem {
  courseId: string;
  classNumber: string;
  sessionId?: string;
  termId?: string;
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
  enrollment?: {
    status?: string;
    enrolledCount?: number;
    minEnroll?: number;
    maxEnroll?: number;
    waitlistedCount?: number;
    maxWaitlist?: number;
    reservations?: {
      number?: number;
      requirementGroup?: string;
      maxEnroll?: number;
      enrolledCount?: number;
    }[];
  };
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
  courseId: { type: String, required: true },
  classNumber: { type: String, required: true },
  sessionId: { type: String },
  termId: { type: String },
  sectionId: { type: String, required: true },
  number: { type: String, required: true },
  subject: { type: String, required: true },
  courseNumber: { type: String, required: true },
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
  primary: { type: Boolean },
  type: { type: String },
  combinedSections: { type: [Number] },
  enrollment: {
    status: { type: String },
    enrolledCount: { type: Number },
    minEnroll: { type: Number },
    maxEnroll: { type: Number },
    waitlistedCount: { type: Number },
    maxWaitlist: { type: Number },
    reservations: [
      {
        number: { type: Number },
        requirementGroup: { type: String },
        maxEnroll: { type: Number },
        enrolledCount: { type: Number },
      },
    ],
  },
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
sectionSchema.index({ sectionId: 1 });

export const NewSectionModel: Model<ISectionItem> = model<ISectionItem>(
  "NewSection",
  sectionSchema
);
