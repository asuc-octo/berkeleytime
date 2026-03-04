import { gql } from "@apollo/client";

export const GET_TARGETED_MESSAGES_FOR_COURSE = gql`
  query GetTargetedMessagesForCourse($courseId: String!) {
    targetedMessagesForCourse(courseId: $courseId) {
      id
      title
      description
      link
      linkText
      persistent
      reappearing
    }
  }
`;

export const INCREMENT_TARGETED_MESSAGE_DISMISS = gql`
  mutation IncrementTargetedMessageDismiss($messageId: ID!) {
    incrementTargetedMessageDismiss(messageId: $messageId) {
      id
      dismissCount
    }
  }
`;
