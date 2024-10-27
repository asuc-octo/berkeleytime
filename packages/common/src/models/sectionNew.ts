import { Document, Schema, model } from "mongoose";

export interface ISectionItem {
  courseId: string;
  classNumber: string;
  sessionId: string;
  termId: string;
  // TODO: make sure to convert id -> sectionId
  sectionId: number;
  number: string;
  component: string;
  status: string;
  instructionMode: string;
  printInScheduleOfClasses: boolean;
  graded: boolean;
  feesExist: boolean;
  startDate: Date;
  endDate: Date;
  addConsentRequired: string;
  dropConsentRequired: string;
  primary: boolean;
  type: string;
  combinedSections: number[];
  enrollment: {
    status: string;
    enrolledCount: number;
    minEnroll: number;
    maxEnroll: number;
    waitlistedCount: number;
    maxWaitlist: number;
    reservations: {
      number: number;
      requirementGroup: string;
      maxEnroll: number;
      enrolledCount: number;
    }[];
  };
  exams: {
    date: Date;
    startTime: string;
    endTime: string;
    location: string;
    number: number;
    type: string;
  }[];
  meetings: {
    number: number;
    days: boolean[];
    startTime: string;
    endTime: string;
    startDate: string;
    endDate: string;
    location: string;
    instructors: {
      printInScheduleOfClasses: boolean;
      familyName: string;
      givenName: string;
      role: string;
    }[];
  }[];
}

export interface ISectionItemDocument extends ISectionItem, Document {}

const sectionSchema = new Schema<ISectionItem>({
  courseId: { type: String, required: true },
  classNumber: { type: String, required: true },
  sessionId: { type: String, required: true },
  termId: { type: String, required: true },
  sectionId: { type: Number, required: true },
  number: { type: String, required: true },
  component: { type: String, required: true },
  status: { type: String, required: true },
  instructionMode: { type: String, required: true },
  printInScheduleOfClasses: { type: Boolean, required: true },
  graded: { type: Boolean, required: true },
  feesExist: { type: Boolean, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  addConsentRequired: { type: String, required: true },
  dropConsentRequired: { type: String, required: true },
  primary: { type: Boolean, required: true },
  type: { type: String, required: true },
  combinedSections: { type: [Number], required: true },
  enrollment: {
    status: { type: String, required: true },
    enrolledCount: { type: Number, required: true },
    minEnroll: { type: Number, required: true },
    maxEnroll: { type: Number, required: true },
    waitlistedCount: { type: Number, required: true },
    maxWaitlist: { type: Number, required: true },
    reservations: [
      {
        number: { type: Number, required: true },
        requirementGroup: { type: String, required: true },
        maxEnroll: { type: Number, required: true },
        enrolledCount: { type: Number, required: true },
      },
    ],
  },
  exams: [
    {
      date: { type: Date, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      location: { type: String, required: true },
      number: { type: Number, required: true },
      type: { type: String, required: true },
    },
  ],
  meetings: [
    {
      number: { type: Number, required: true },
      days: { type: [Boolean], required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      startDate: { type: String, required: true },
      endDate: { type: String, required: true },
      location: { type: String, required: true },
      instructors: [
        {
          printInScheduleOfClasses: { type: Boolean, required: true },
          familyName: { type: String, required: true },
          givenName: { type: String, required: true },
          role: { type: String, required: true },
        },
      ],
    },
  ],
});

export const NewSectionModel = model<ISectionItem>("NewSection", sectionSchema);
