import { gql } from "@apollo/client";

export const GET_COURSE_COMMENTS = gql`
  query GetCourseComments($subject: String!, $courseNumber: String!) {
    courseComments(subject: $subject, courseNumber: $courseNumber) {
      id
      content
      createdBy
      createdAt
      updatedAt
    }
  }
`;

export const ADD_COURSE_COMMENT = gql`
  mutation AddCourseComment(
    $subject: String!
    $courseNumber: String!
    $content: String!
  ) {
    addCourseComment(
      subject: $subject
      courseNumber: $courseNumber
      content: $content
    ) {
      id
      content
      createdBy
      createdAt
      updatedAt
    }
  }
`;
