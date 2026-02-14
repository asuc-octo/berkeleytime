import { Model, Schema, model } from "mongoose";

export interface IClassViewCount {
  year: number;
  semester: string;
  sessionId: string;
  subject: string;
  courseNumber: string;
  number: string;
  viewCount: number;
}

const classViewCountSchema = new Schema<IClassViewCount>({
  year: { type: Number, required: true },
  semester: { type: String, required: true },
  sessionId: { type: String, required: true },
  subject: { type: String, required: true },
  courseNumber: { type: String, required: true },
  number: { type: String, required: true },
  viewCount: { type: Number, default: 0 },
});

classViewCountSchema.index(
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

export const ClassViewCountModel: Model<IClassViewCount> =
  model<IClassViewCount>("classviewcounts", classViewCountSchema);
