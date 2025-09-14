import { gql } from "@apollo/client";

export interface IDiscussionComment {
  id: string;
  subject: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionCommentsResponse {
  discussionComments: IDiscussionComment[];
}

export interface CreateDiscussionCommentResponse {
  createDiscussionComment: IDiscussionComment;
}

export interface DiscussionCommentFilter {
  subject?: string;
  userId?: string;
}

export interface CreateDiscussionCommentInput {
  subject: string;
  content: string;
}

export const GET_DISCUSSION_COMMENTS = gql`
  query GetDiscussionComments(
    $filter: DiscussionCommentFilter
    $limit: Int
    $offset: Int
  ) {
    discussionComments(filter: $filter, limit: $limit, offset: $offset) {
      id
      subject
      userId
      content
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_DISCUSSION_COMMENT = gql`
  mutation CreateDiscussionComment($input: CreateDiscussionCommentInput!) {
    createDiscussionComment(input: $input) {
      id
      subject
      userId
      content
      createdAt
      updatedAt
    }
  }
`;
