import { gql } from "graphql-tag";

export const targetedMessageTypeDef = gql`
  """
  A targeted message displayed on specific course pages.
  """
  type TargetedMessage @cacheControl(maxAge: 0) {
    id: ID!
    title: String!
    description: String
    link: String
    linkText: String
    visible: Boolean!
    persistent: Boolean!
    reappearing: Boolean!
    clickCount: Int!
    dismissCount: Int!
    clickEventLogging: Boolean!
    currentVersion: Int!
    targetCourses: [TargetedMessageCourse!]!
    createdAt: String!
    updatedAt: String!
  }

  """
  A course targeted by a message.
  """
  type TargetedMessageCourse {
    courseId: String!
    subject: String!
    courseNumber: String!
  }

  input TargetedMessageCourseInput {
    courseId: String!
    subject: String!
    courseNumber: String!
  }

  input CreateTargetedMessageInput {
    title: String!
    description: String
    link: String
    linkText: String
    persistent: Boolean!
    reappearing: Boolean!
    clickEventLogging: Boolean
    targetCourses: [TargetedMessageCourseInput!]!
  }

  input UpdateTargetedMessageInput {
    title: String
    description: String
    link: String
    linkText: String
    persistent: Boolean
    reappearing: Boolean
    clickEventLogging: Boolean
    visible: Boolean
    targetCourses: [TargetedMessageCourseInput!]
  }

  extend type Query {
    targetedMessagesForCourse(courseId: String!): [TargetedMessage!]!
    allTargetedMessagesForStaff: [TargetedMessage!]! @auth
  }

  extend type Mutation {
    incrementTargetedMessageDismiss(messageId: ID!): TargetedMessage!
    createTargetedMessage(input: CreateTargetedMessageInput!): TargetedMessage!
      @auth
    updateTargetedMessage(
      messageId: ID!
      input: UpdateTargetedMessageInput!
    ): TargetedMessage! @auth
    deleteTargetedMessage(messageId: ID!): Boolean! @auth
  }
`;
