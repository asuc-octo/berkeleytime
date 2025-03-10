// discussion/formatter.ts – Formats data for output
import { DiscussionType } from "@repo/common";

import { DiscussionModule } from "./generated-types/module-types";

// export interface IntermediateDiscussion {
//   text: string;
//   user: {
//     id: string;
//     name: string;
//   };
//   course: {
//     courseId: string;
//     title: string;
//   };
//   timestamp: string;
// }

export const formatDiscussion = (
  discussion: DiscussionType
): DiscussionModule.Discussion => {
  return {
    text: discussion.text,
    userId: discussion.userId,
    courseId: discussion.courseId,
    timestamp: new Date(discussion.timestamp).toLocaleString(),
  };
};
