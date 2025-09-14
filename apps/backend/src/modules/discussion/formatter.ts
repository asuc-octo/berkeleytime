import { IDiscussionItem } from "@repo/common";

export function formatDiscussion(discussion: IDiscussionItem) {
  return {
    ...discussion,
  };
}