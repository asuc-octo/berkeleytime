import { CommentType } from "@repo/common";

export interface DiscussionRelationships {
  createdBy: string;
  courseNumber: string;
}

export type FormattedDiscussion = Omit<
  CommentType,
  keyof DiscussionRelationships
> &
  DiscussionRelationships;

export const formatDiscussion = async (discussion: CommentType) => {
  return {
    //createdBy: user,
    _id: discussion._id as string,
    courseNumber: discussion.courseNumber,
    text: discussion.text,
    timestamp: discussion.createdAt.toISOString(),
    createdBy: discussion.createdBy,
  } as unknown as FormattedDiscussion;
};
