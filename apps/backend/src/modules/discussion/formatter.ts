import { IDiscussionItem } from "@repo/common";

import { DiscussionModule } from "./generated-types/module-types";

export const formatDiscussion = (discussion: IDiscussionItem) => {
  const output = {
    ...discussion,
  } as DiscussionModule.Discussion;

  return output;
};
