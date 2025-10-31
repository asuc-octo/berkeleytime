import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

const curatedClassSchema = new Schema(
  {
    semester: { type: String, required: true },
    year: { type: Number, required: true },
    sessionId: { type: String, required: true },
    courseNumber: { type: String, required: true },
    number: { type: String, required: true },
    subject: { type: String, required: true },
    image: {
      type: String,
      required: true,
    },
    text: { type: String, required: true },
    publishedAt: {
      type: Date,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const CuratedClassModel = mongoose.model(
  "CuratedClass",
  curatedClassSchema
);

export type CuratedClassType = Document &
  InferSchemaType<typeof curatedClassSchema>;
