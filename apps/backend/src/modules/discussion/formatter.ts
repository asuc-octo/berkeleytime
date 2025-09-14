import { IDiscussionCommentDocument } from "@repo/common";
import { Types } from "mongoose";

export interface DiscussionCommentFormatted {
  id: string;
  subject: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DiscussionFormatter {
  /**
   * Format a single discussion comment for GraphQL output
   */
  static formatComment(comment: IDiscussionCommentDocument): DiscussionCommentFormatted {
    console.log("=== DiscussionFormatter.formatComment ===");
    console.log("Input comment ID:", comment._id);
    console.log("Input comment subject:", comment.subject);
    console.log("Input comment userId:", comment.userId);
    
    const formatted = {
      id: comment._id instanceof Types.ObjectId ? comment._id.toString() : String(comment._id),
      subject: comment.subject,
      userId: comment.userId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
    
    console.log("Formatted comment ID:", formatted.id);
    console.log("Formatted comment subject:", formatted.subject);
    return formatted;
  }

  /**
   * Format multiple discussion comments for GraphQL output
   */
  static formatComments(comments: IDiscussionCommentDocument[]): DiscussionCommentFormatted[] {
    return comments.map(comment => this.formatComment(comment));
  }
}
