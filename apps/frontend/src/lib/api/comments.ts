import { gql } from "@apollo/client";

import { CourseComment } from "../generated/graphql";

export type ICourseComment = CourseComment;

export const GET_COURSE_COMMENTS = gql`
  query GetCourseComments(
    $subject: String!
    $courseNumber: String!
    $userId: String
  ) {
    courseComments(
      subject: $subject
      courseNumber: $courseNumber
      userId: $userId
    ) {
      id
      courseId
      subject
      courseNumber
      userId
      text
      createdAt
      updatedAt
    }
  }
`;

export const ADD_COURSE_COMMENT = gql`
  mutation AddCourseComment($input: AddCourseCommentInput!) {
    addCourseComment(input: $input) {
      id
      courseId
      subject
      courseNumber
      userId
      text
      createdAt
      updatedAt
    }
  }
`;
