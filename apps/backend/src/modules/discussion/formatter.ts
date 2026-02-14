import { IDiscussionItem } from "@repo/common/models";

import { DiscussionModule } from "./generated-types/module-types";

export const formatComment = (
  comment: IDiscussionItem
): DiscussionModule.Comment => {
  return {
    id: comment._id.toString(),
    subject: comment.subject,
    courseNumber: comment.courseNumber,
    userEmail: comment.userEmail,
    text: comment.text,
    timestamp: comment.timestamp.toISOString(),
  };
};