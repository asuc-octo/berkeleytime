import { Document, Schema, model } from "mongoose";

export interface IComment extends Document{
  courseId: string;
  userId: string;
  text: string;
}

const CommentSchema = new Schema<IComment>({
  courseId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export const Comment = model<IComment>('Comment', CommentSchema);