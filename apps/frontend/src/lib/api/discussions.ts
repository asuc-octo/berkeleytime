import { gql } from "@apollo/client";

export interface IDiscussion {
  discussionId: string;
  classId: string;
  userId: string;
  content: string;
  timestamp: string;
  parentId?: string;
  user?: {
    email?: string;
    name?: string;
  };
}

export const GET_DISCUSSIONS_BY_CLASS = gql`
  query GetDiscussionsByClass(
    $year: Int!
    $semester: Semester!
    $sessionId: SessionIdentifier
    $subject: String!
    $courseNumber: CourseNumber!
    $classNumber: ClassNumber!
  ) {
    discussionsByClass(
      year: $year
      semester: $semester
      sessionId: $sessionId
      subject: $subject
      courseNumber: $courseNumber
      classNumber: $classNumber
    ) {
      discussionId
      classId
      userId
      content
      timestamp
      parentId
      user {
        email
      }
    }
  }
`;

export const ADD_DISCUSSION = gql`
  mutation AddDiscussion(
    $year: Int!
    $semester: Semester!
    $sessionId: SessionIdentifier
    $subject: String!
    $courseNumber: CourseNumber!
    $classNumber: ClassNumber!
    $content: String!
  ) {
    addDiscussion(
      year: $year
      semester: $semester
      sessionId: $sessionId
      subject: $subject
      courseNumber: $courseNumber
      classNumber: $classNumber
      content: $content
    ) {
      discussionId
      classId
      userId
      content
      timestamp
      parentId
      user {
        email
      }
    }
  }
`;

export const DELETE_DISCUSSION = gql`
  mutation DeleteDiscussion($discussionId: DiscussionIdentifier!) {
    deleteDiscussion(discussionId: $discussionId)
  }
`;
