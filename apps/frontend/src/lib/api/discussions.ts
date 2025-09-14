import { gql } from "@apollo/client";

export interface IDiscussion {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  classId: string;
}

export interface DiscussionsByClassResponse {
  discussionsByClass: IDiscussion[];
}

export interface AllDiscussionsResponse {
  allDiscussions: IDiscussion[];
}

export const GET_DISCUSSIONS_BY_CLASS = gql`
  query GetDiscussionsByClass($classId: ID!) {
    discussionsByClass(classId: $classId) {
      id
      content
      author
      createdAt
      classId
    }
  }
`;

export const GET_ALL_DISCUSSIONS = gql`
  query GetAllDiscussions {
    allDiscussions {
      id
      content
      author
      createdAt
      classId
    }
  }
`;

export const CREATE_DISCUSSION = gql`
  mutation CreateDiscussion($content: String!, $author: String!, $classId: ID!) {
    createDiscussion(content: $content, author: $author, classId: $classId) {
      id
      content
      author
      createdAt
      classId
    }
  }
`;

export const DELETE_DISCUSSION = gql`
  mutation DeleteDiscussion($id: ID!) {
    deleteDiscussion(id: $id)
  }
`;
