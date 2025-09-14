import mongoose, { Document, Schema } from "mongoose";

export interface IDiscussionComment {
  subject: string;
  userId: string;
  content: string;
  createdAt: Date;
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
      maxlength: 1000
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

// Indexes
discussionCommentSchema.index({ subject: 1, userId: 1 });
discussionCommentSchema.index({ subject: 1, createdAt: -1 });

// 👇 Explicit collection name
const DiscussionCommentModel = mongoose.model<IDiscussionComment>(
  "DiscussionComment",
  discussionCommentSchema,
  "discussion_comments" // ensure it always uses this collection
);

export interface CreateDiscussionCommentInput {
  subject: string;
  content: string;
}

export interface DiscussionCommentFilter {
  subject?: string | null;
  userId?: string | null;
}

export interface DiscussionCommentQueryOptions {
  limit?: number;
  offset?: number;
}

export class DiscussionController {
  async createComment(
    input: CreateDiscussionCommentInput,
    userId: string
  ): Promise<IDiscussionCommentDocument> {
    try {
      const savedComment = await DiscussionCommentModel.create({
        subject: input.subject.trim(), // Keep original case
        userId,
        content: input.content,
      });

      return savedComment;
    } catch (error) {
      console.error("Error in controller createComment:", error);
      throw error;
    }
  }

  async getComments(
    filter: DiscussionCommentFilter = {},
    options: DiscussionCommentQueryOptions = {}
  ): Promise<IDiscussionCommentDocument[]> {
    const query: Record<string, any> = {};

    if (filter.subject) {
      query.subject = filter.subject.trim(); // Keep original case
    }
    if (filter.userId) {
      query.userId = filter.userId;
    }

    const mongoQuery = DiscussionCommentModel.find(query);

    if (options.limit) mongoQuery.limit(options.limit);
    if (options.offset) mongoQuery.skip(options.offset);

    mongoQuery.sort({ createdAt: -1 });

    return mongoQuery.exec();
  }
}
