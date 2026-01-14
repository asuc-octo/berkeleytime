import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

export const podSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

podSchema.index({ year: 1, semester: 1 });

export const PodModel = mongoose.model("pods", podSchema);

export type PodType = Document & InferSchemaType<typeof podSchema>;
