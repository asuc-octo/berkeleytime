import { Document, Model, Schema, model } from "mongoose";

export interface IEnrollmentHistoryItem {
  termId: string;
  year: number;
  semester: string;
  sessionId: string;
  sectionId: string;
  subject: string;
  courseNumber: string;
  sectionNumber: string;

  history: {
    time: string;
    status?: string;
    enrolledCount?: number;
    reservedCount?: number;
    waitlistedCount?: number;
    minEnroll?: number;
    maxEnroll?: number;
    maxWaitlist?: number;
    openReserved?: number;
    instructorAddConsentRequired?: boolean;
    instructorDropConsentRequired?: boolean;
    seatReservationCount?: {
      number: number; // maps to seatReservations.number to get requirementGroup
      maxEnroll: number;
      enrolledCount?: number;
    }[];
  }[];
  // maps number to requirementGroup.
  // this assumes that these fields are constant over time.
  seatReservationTypes?: {
    number: number;
    requirementGroup?: string;
    fromDate: string;
  }[];
}

export interface IEnrollmentSingularItem
  extends Omit<IEnrollmentHistoryItem, "history"> {
  data: IEnrollmentHistoryItem["history"][0];
}

export interface IEnrollmentHistoryItemDocument
  extends IEnrollmentHistoryItem,
    Document {}

const enrollmentHistorySchema = new Schema<IEnrollmentHistoryItem>({
  termId: { type: String, required: true },
  year: { type: Number, required: true },
  semester: { type: String, required: true },
  sessionId: { type: String, required: true },
  sectionId: { type: String, required: true },
  subject: { type: String, required: true },
  courseNumber: { type: String, required: true },
  sectionNumber: { type: String, required: true },

  history: [
    {
      _id: false,
      time: { type: String, required: true },
      status: { type: String },
      enrolledCount: { type: Number },
      reservedCount: { type: Number },
      waitlistedCount: { type: Number },
      minEnroll: { type: Number },
      maxEnroll: { type: Number },
      maxWaitlist: { type: Number },
      openReserved: { type: Number },
      instructorAddConsentRequired: { type: Boolean },
      instructorDropConsentRequired: { type: Boolean },
      seatReservationCount: [
        {
          _id: false,
          number: { type: Number },
          maxEnroll: { type: Number },
          enrolledCount: { type: Number },
        },
      ],
    },
  ],
  seatReservationTypes: [
    {
      _id: false,
      number: { type: Number },
      requirementGroup: { type: String },
      fromDate: { type: String },
    },
  ],
});

// for enrollment controller
enrollmentHistorySchema.index({ termId: 1, sessionId: 1, sectionId: 1 });

// for enrollment controller
enrollmentHistorySchema.index({
  year: 1,
  semester: 1,
  sessionId: 1,
  subject: 1,
  courseNumber: 1,
  sectionNumber: 1,
});

export const NewEnrollmentHistoryModel: Model<IEnrollmentHistoryItem> =
  model<IEnrollmentHistoryItem>("enrollmentHistories", enrollmentHistorySchema);
