import { gql } from "@apollo/client";

export interface IDiscussion {
  text: string;
  userId: string;
  courseId: string;
  timestamp: string; // ISO string or Date object
}

export const GET_DISCUSSIONS_BY_COURSE = gql`
  query GetDiscussionsByCourse($courseId: String!) {
    getDiscussionsByCourse(courseId: $courseId) {
      text
      userId
      courseId
      timestamp
    }
  }
`;

export const ADD_DISCUSSION = gql`
  mutation AddDiscussion($courseId: String!, $text: String!) {
    addDiscussion(courseId: $courseId, text: $text) {
      text
      userId
      courseId
      timestamp
    }
  }
`;
