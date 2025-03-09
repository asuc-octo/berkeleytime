import { IDiscussionItem } from "@repo/common";

export function formatDiscussion(discussion: IDiscussionItem) {
  return { ...discussion };
}

export const formatDiscussions = (discussions: IDiscussionItem[]) => {
  return discussions.map(formatDiscussion);
};
