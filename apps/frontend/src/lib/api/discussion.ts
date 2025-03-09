import { gql } from "@apollo/client";

import { ICourse } from "./courses";
import { IUser } from "./users";

export interface IDiscussion {
  text: string;
  user: IUser;
  course: ICourse;
  timestamp: string; // ISO string or Date object
}

export const GET_DISCUSSIONS_BY_COURSE = gql`
  query GetDiscussionsByCourse($courseId: String!) {
    getDiscussionsByCourse(courseId: $courseId) {
      text
      user {
        id
        name
      }
      course {
        courseId
        title
      }
      timestamp
    }
  }
`;

export const ADD_DISCUSSION = gql`
  query AddDiscussion($courseId: String!, $text: String!, $userId: String!) {
    addDiscussion(courseId: $courseId, text: $text, userId: $userId) {
      text
      user {
        id
        name
      }
      course {
        courseId
        title
      }
      timestamp
    }
  }
`;
