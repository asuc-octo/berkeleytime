import mongoose, { Schema, InferSchemaType, Document } from "mongoose";

const MessageSchema = new mongoose.Schema({
    sender: String,
    receiver: String,
    message: String,
});

export const MessageModel = mongoose.model("message", MessageSchema, "message");
export type MessageType = Document & InferSchemaType<typeof MessageSchema>;