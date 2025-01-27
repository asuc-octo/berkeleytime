import { Document, Model, Schema, model } from "mongoose";

export interface IEnrollmentHistoryItem {
  termId: string;
  sessionId: string;
  sectionId: string;

  // maps number to requirementGroup
  seatReservations?: {
    number: number;
    requirementGroup?: string;
    fromDate: string;
  }[];
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
    seatReservations?: {
      number: number; // maps to seatReservations.number to get requirementGroup
      maxEnroll: number;
      enrolledCount?: number;
    }[];
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
  sessionId: { type: String, required: true },
  sectionId: { type: String, required: true },
  history: [
    {
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
      seatReservations: [
        {
          number: { type: Number },
          maxEnroll: { type: Number },
          enrolledCount: { type: Number },
        },
      ],
    },
  ],
  seatReservations: [
    {
      number: { type: Number },
      requirementGroup: { type: String },
      fromDate: { type: String },
    },
  ],
});
enrollmentHistorySchema.index(
  { termId: 1, sessionId: 1, sectionId: 1 },
  { unique: true }
);

export const NewEnrollmentHistoryModel: Model<IEnrollmentHistoryItem> =
  model<IEnrollmentHistoryItem>(
    "NewEnrollmentHistory",
    enrollmentHistorySchema
  );
