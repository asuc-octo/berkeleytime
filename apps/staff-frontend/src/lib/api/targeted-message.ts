import { gql } from "@apollo/client";

// Types
export interface TargetedMessageCourse {
  courseId: string;
  subject: string;
  courseNumber: string;
}

export interface TargetedMessage {
  id: string;
  title: string;
  description: string | null;
  link: string | null;
  linkText: string | null;
  visible: boolean;
  persistent: boolean;
  reappearing: boolean;
  clickCount: number;
  dismissCount: number;
  clickEventLogging: boolean;
  currentVersion: number;
  targetCourses: TargetedMessageCourse[];
  createdAt: string;
  updatedAt: string;
}

// Queries
export const ALL_TARGETED_MESSAGES_FOR_STAFF = gql`
  query AllTargetedMessagesForStaff {
    allTargetedMessagesForStaff {
      id
      title
      description
      link
      linkText
      visible
      persistent
      reappearing
      clickCount
      dismissCount
      clickEventLogging
      currentVersion
      targetCourses {
        courseId
        subject
        courseNumber
      }
      createdAt
      updatedAt
    }
  }
`;

// Mutations
export interface TargetedMessageCourseInput {
  courseId: string;
  subject: string;
  courseNumber: string;
}

export interface CreateTargetedMessageInput {
  title: string;
  description?: string | null;
  link?: string | null;
  linkText?: string | null;
  persistent: boolean;
  reappearing: boolean;
  clickEventLogging?: boolean | null;
  targetCourses: TargetedMessageCourseInput[];
}

export interface UpdateTargetedMessageInput {
  title?: string | null;
  description?: string | null;
  link?: string | null;
  linkText?: string | null;
  persistent?: boolean | null;
  reappearing?: boolean | null;
  clickEventLogging?: boolean | null;
  visible?: boolean | null;
  targetCourses?: TargetedMessageCourseInput[] | null;
}

export const CREATE_TARGETED_MESSAGE = gql`
  mutation CreateTargetedMessage($input: CreateTargetedMessageInput!) {
    createTargetedMessage(input: $input) {
      id
      title
      description
      link
      linkText
      visible
      persistent
      reappearing
      clickCount
      dismissCount
      clickEventLogging
      currentVersion
      targetCourses {
        courseId
        subject
        courseNumber
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_TARGETED_MESSAGE = gql`
  mutation UpdateTargetedMessage(
    $messageId: ID!
    $input: UpdateTargetedMessageInput!
  ) {
    updateTargetedMessage(messageId: $messageId, input: $input) {
      id
      title
      description
      link
      linkText
      visible
      persistent
      reappearing
      clickCount
      dismissCount
      clickEventLogging
      currentVersion
      targetCourses {
        courseId
        subject
        courseNumber
      }
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_TARGETED_MESSAGE = gql`
  mutation DeleteTargetedMessage($messageId: ID!) {
    deleteTargetedMessage(messageId: $messageId)
  }
`;
