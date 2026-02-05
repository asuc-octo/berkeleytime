import { gql } from "graphql-tag";

export const targetedMessageTypeDef = gql`
  """
  A targeted message displayed on specific course pages.
  """
  type TargetedMessage @cacheControl(maxAge: 0) {
    id: ID!
    text: String!
    link: String
    linkText: String
    visible: Boolean!
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
`;
