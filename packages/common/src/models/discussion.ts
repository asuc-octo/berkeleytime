import mongoose, { InferSchemaType, Schema } from "mongoose";

const discussionSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },

    createdBy: {
      type: String,
      trim: true,
      required: true,
    },
    subject: { type: String, required: true, index: true },
    courseNumber: { type: String, required: true, index: true },
    semester: { type: String, required: true, index: true },
    year: { type: Number, required: true, index: true },
    classNumber: { type: String, required: true, index: true },
    value: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

export const DiscussionModel = mongoose.model("discussion", discussionSchema);
export type DiscussionType = InferSchemaType<typeof discussionSchema>;