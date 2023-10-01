import mongoose, { Schema, InferSchemaType, Document } from "mongoose";
import { IsoDate } from "../generated-types/graphql";

export const MessageSchema = new Schema({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  body: {
    type: String,
    required: true,
  },
  created_by: {
    type: String,
    required: true,
    trim: true,
    alias: "creator"
  },
});

export type MessageType = Document & InferSchemaType<typeof MessageSchema>;
export const MessageModel = mongoose.model("message", MessageSchema, "message");
