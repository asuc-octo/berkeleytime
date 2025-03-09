// discussion/formatter.ts – Formats data for output
import { DiscussionType } from "@repo/common";

export interface IntermediateDiscussion {
  text: string;
  user: {
    id: string;
    name: string;
  };
  course: {
    courseId: string;
    title: string;
  };
  timestamp: string;
}

export const formatDiscussion = (
  discussion: DiscussionType
): IntermediateDiscussion => {
  return {
    text: discussion.text,
    user: {
      id: discussion.user,
      name: `User ${discussion.user}`,
    },
    course: {
      courseId: discussion.course,
      title: `Course ${discussion.course}`,
    },
    timestamp: new Date(discussion.timestamp).toLocaleString(),
  };
};
