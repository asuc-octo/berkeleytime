import mongoose, { Schema, InferSchemaType, Document } from 'mongoose'

export const MessageSchema = new Schema(
  {
    chat_id: {
      type: String,
      required: true,
      trim: true,
    },
    sender: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
)

export type MessageType = Document & InferSchemaType<typeof MessageSchema>
export const MessageModel = mongoose.model<MessageType>('message', MessageSchema, 'messages')
