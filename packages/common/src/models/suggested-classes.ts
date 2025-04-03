import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

const julianaSchema = new Schema({
  image: { type: String, required: true },
  text: { type: String, required: true },
});

const postSchema = new Schema({
  semester: 
    {type: String, required: true}, 
  year: 
    { type: Number, required: true },
  sessionId: 
    { type: String, required: true },
  courseNumber: 
    { type: String, required: true },
  number: 
    { type: Number, required: true },
  subject: 
    { type: String, required: true },
  juliana: 
      { type: julianaSchema, required: true },
});

export const postModel = mongoose.model("Post", postSchema);
export type postType = Document & InferSchemaType<typeof postSchema>;