import { gql } from "@apollo/client";

export const GET_COMMENTS = gql`
  query GetComments($subject: String!, $courseNumber: String!, $userEmail: String) {
    getComments(subject: $subject, courseNumber: $courseNumber, userEmail: $userEmail) {
      id
      subject
      courseNumber
      userEmail
      text
      timestamp
    }
  }
`;

export const POST_COMMENT = gql`
  mutation PostComment($subject: String!, $courseNumber: String!, $text: String!) {
    postComment(subject: $subject, courseNumber: $courseNumber, text: $text) {
      id
      subject
      courseNumber
      userEmail
      text
      timestamp
    }
  }
`;
