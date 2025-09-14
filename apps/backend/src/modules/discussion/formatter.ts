import { IDiscussionItem } from "@repo/common";

import { DiscussionModule } from "./generated-types/module-types";

export interface IntermediateDiscussion {
  discussionId: string;
  classId: string;
  userId: string;
  content: string;
  timestamp: string;
  parentId?: string;
  class?: DiscussionModule.Class;
  user?: DiscussionModule.User;
}

export const formatDiscussion = (
  discussion: IDiscussionItem
): IntermediateDiscussion => {
  return {
    discussionId: discussion.discussionId,
    classId: discussion.classId,
    userId: discussion.userId,
    content: discussion.content,
    timestamp: discussion.timestamp.toISOString(),
    parentId: discussion.parentId,
  };
};
