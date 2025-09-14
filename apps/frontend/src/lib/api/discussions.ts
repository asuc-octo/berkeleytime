import { gql } from "@apollo/client";

// Define TypeScript types for our data
export interface IComment {
  id: string;
  text: string;
  userId: string;
  createdAt: string;
}

export interface ReadDiscussionResponse {
  commentsByCourse: IComment[];
}

// GraphQL query to fetch comments
export const READ_DISCUSSION = gql`
  query ReadDiscussion($courseId: String!) {
    commentsByCourse(courseId: $courseId) {
      id
      text
      userId
      createdAt
    }
  }
`;

// GraphQL mutation to add a new comment
export const ADD_COMMENT = gql`
  mutation AddComment($courseId: String!, $userId: String!, $text: String!) {
    addComment(courseId: $courseId, userId: $userId, text: $text) {
      id
      text
      userId
      createdAt
    }
  }
`;