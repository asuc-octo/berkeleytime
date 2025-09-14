import mongoose, { Document, Schema } from "mongoose";

export interface IDiscussionComment {
  // The subject this comment is about
  subject: string;
  // The user who made the comment
  userId: string;
  // The comment content
  content: string;
  // When the comment was created
  createdAt: Date;
  // When the comment was last updated
  updatedAt: Date;
}

export interface IDiscussionCommentDocument extends IDiscussionComment, Document {}

const discussionCommentSchema = new Schema<IDiscussionComment>(
  {
    subject: { 
      type: String, 
      required: true,
      index: true 
    },
    userId: { 
      type: String, 
      required: true,
      index: true 
    },
    content: { 
      type: String, 
      required: true,
      maxlength: 1000 // Limit comment length
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

// Compound index for efficient queries by subject and user
discussionCommentSchema.index({ subject: 1, userId: 1 });
discussionCommentSchema.index({ subject: 1, createdAt: -1 }); // For sorting by newest first

export const DiscussionCommentModel = mongoose.model<IDiscussionComment>(
  "discussion_comments",
  discussionCommentSchema
);
