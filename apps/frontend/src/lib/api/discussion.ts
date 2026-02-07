import { gql } from "@apollo/client";

export const GET_COMMENTS = gql`
  query GetComments($courseId: CourseIdentifier!) {
    comments(courseId: $courseId) {
      _id
      courseId
      userId
      comment
      createdAt
      updatedAt
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation AddComment($courseId: CourseIdentifier!, $comment: String!) {
    addComment(courseId: $courseId, comment: $comment) {
      _id
      courseId
      userId
      comment
      createdAt
      updatedAt
    }
  }
`;

