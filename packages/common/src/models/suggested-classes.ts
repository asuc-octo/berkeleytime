import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

const postSchema = new Schema(
  {
    semester: { type: String, required: true },
    year: { type: Number, required: true },
    sessionId: { type: String, required: true },
    courseNumber: { type: String, required: true },
    number: { type: Number, required: true },
    subject: { type: String, required: true },
    image: {
      type: String,
      required: true,
    },
    text: {
      image: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export const PostModel = mongoose.model("Post", postSchema);
export type PostType = Document & InferSchemaType<typeof postSchema>;
