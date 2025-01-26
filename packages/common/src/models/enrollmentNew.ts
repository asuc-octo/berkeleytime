import { Document, Model, Schema, model } from "mongoose";

export interface IEnrollmentItem {
  termId: string;
  sessionId: string;
  sectionId: string;
  data: [
    {
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
      seatReservations?: [
        {
          number?: number;
          requirementGroup?: string;
          fromDate?: string;
          maxEnroll?: number;
          enrolledCount?: number;
        },
      ];
    },
  ];
}

export interface IEnrollmentItemDocument extends IEnrollmentItem, Document {}

const enrollmentSchema = new Schema<IEnrollmentItem>({
  termId: { type: String, required: true },
  sessionId: { type: String, required: true },
  sectionId: { type: String, required: true },
  data: [
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
          requirementGroup: { type: String },
          fromDate: { type: String },
          maxEnroll: { type: Number },
          enrolledCount: { type: Number },
        },
      ],
    },
  ],
});
enrollmentSchema.index(
  { termId: 1, sessionId: 1, sectionId: 1 },
  { unique: true }
);

export const NewEnrollmentModel: Model<IEnrollmentItem> =
  model<IEnrollmentItem>("NewEnrollment", enrollmentSchema);
