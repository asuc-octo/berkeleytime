import { gql } from "@apollo/client";

export const GET_COURSE_DISCUSSIONS = gql`
  query GetCourseDiscussions($courseId: CourseIdentifier!) {
    courseDiscussions(courseId: $courseId) {
      _id
      timestamp
      userId
      user {
        email
        name
      }
      courseId
      comment
    }
  }
`;

export const ADD_COURSE_DISCUSSION = gql`
  mutation AddCourseDiscussion(
    $courseId: CourseIdentifier!
    $comment: String!
  ) {
    addCourseDiscussion(courseId: $courseId, comment: $comment) {
      _id
      timestamp
      userId
      user {
        email
        name
      }
      courseId
      comment
    }
  }
`;
