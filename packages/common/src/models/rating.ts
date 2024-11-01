import mongoose, { InferSchemaType, Schema } from "mongoose";

const ratingSchema = new Schema({
  _id: Schema.Types.ObjectId,
  createdBy: {
    type: String,
    trim: true,
    required: true,
    immutable: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    immutable: true,
  },
  subject: {
    type: String,
    required: true,
  },
  courseNumber: {
    type: String,
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
  class: {
    type: String,
    required: true,
  },
  metricName: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger,
    }
  }
}, {
  timestamps: {
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
});

export const RatingModel = mongoose.model("CrowdSource", ratingSchema,);
export type RatingType = InferSchemaType<typeof ratingSchema>;