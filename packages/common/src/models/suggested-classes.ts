import mongoose, { Document, InferSchemaType, Schema } from "mongoose";
const { v4: uuidv4 } = require('uuid');

const postSchema = new Schema({
  postId: {
    type: uuidv4, required: true
  },
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
  image: {
    type: String, required: true
  }, 
  text: {
    image: {type: String, required: true}
  }, 
});

export const postModel = mongoose.model("Post", postSchema);
export type postType = Document & InferSchemaType<typeof postSchema>;