import { gql } from "@apollo/client";

export const GET_COURSE_COMMENTS = gql`
  query GetCourseComments($courseId: CourseIdentifier!) {
    courseComments(courseId: $courseId) {
      id
      courseId
      createdBy
      body
      createdAt
    }
  }
`;

export const ADD_COURSE_COMMENT = gql`
  mutation AddCourseComment($courseId: CourseIdentifier!, $body: String!) {
    addCourseComment(courseId: $courseId, body: $body) {
      id
      courseId
      createdBy
      body
      createdAt
    }
  }
`;
