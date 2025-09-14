import mongoose, { Schema, InferSchemaType } from "mongoose";

const DiscussionSchema = new Schema(
  {
    content: { type: String, required: true, trim: true },
    author:  { type: String, required: true, trim: true },
    classId: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export type DiscussionDoc = InferSchemaType<typeof DiscussionSchema>;

const Discussion =
  mongoose.models.Discussion || mongoose.model<DiscussionDoc>("discussions", DiscussionSchema);

export default Discussion;
