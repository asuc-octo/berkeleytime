import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

export const adTargetSchema = new Schema(
  {
    subjects: {
      type: [String],
      required: false,
      default: [],
    },
    minCourseNumber: {
      type: String,
      required: false,
      trim: true,
    },
    maxCourseNumber: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

export const AdTargetModel = mongoose.model("adtargets", adTargetSchema);

export type AdTargetType = Document & InferSchemaType<typeof adTargetSchema>;
