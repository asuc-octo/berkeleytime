import { gql } from "@apollo/client";

export const GET_COURSE_COMMENTS = gql`
  query GetCourseComments(
    $subject: String!
    $courseNumber: CourseNumber!
    $createdBy: String
  ) {
    courseComments(
      subject: $subject
      courseNumber: $courseNumber
      createdBy: $createdBy
    ) {
      id
      courseId
      subject
      courseNumber
      createdBy
      comment
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_COURSE_COMMENT = gql`
  mutation CreateCourseComment($input: CreateCourseCommentInput!) {
    createCourseComment(input: $input) {
      id
      courseId
      subject
      courseNumber
      createdBy
      comment
      createdAt
      updatedAt
    }
  }
`;
