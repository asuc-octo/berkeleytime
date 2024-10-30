import mongoose, { InferSchemaType, Schema } from "mongoose";

const ratingSchema = new Schema({
  _id: Schema.Types.ObjectId,
  google_id: {
    type: String,
    trim: true,
    required: true,
    immutable: true,
    select: false,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    immutable: true,
  },
  class: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
    immutable: true
  },
  // likert int 1 -> 5 values
  // boolean 0/1 values
  // string properties assign hash code
  value: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger,
    }
  },
  // indicate value type (granularity: specific questions)
  value_type: {
    type: String,
    required: true,
  }
}, {
  timestamps: {
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
});

export const RatingModel = mongoose.model(
  "crowdsource_rating",
  ratingSchema,
  "crowdsource_rating"
);
export type RatingType = InferSchemaType<typeof ratingSchema>;