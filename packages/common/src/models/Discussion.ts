import mongoose, { InferSchemaType, Schema } from "mongoose";

const discussionSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    courseId: { type: String, required: true, index: true },
    createdBy: { type: String, trim: true, required: true, immutable: true },
    body: { type: String, trim: true, required: true } },
  { timestamps: true }
);

discussionSchema.index({ courseId: 1, createdBy: 1 });

export const DiscussionModel = mongoose.model("discussion", discussionSchema);
export type DiscussionType = InferSchemaType<typeof discussionSchema>;
