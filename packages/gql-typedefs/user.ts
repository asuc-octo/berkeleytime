import { gql } from "graphql-tag";

export const userTypeDef = gql`
  type MonitoredClass {
    class: Class!
    thresholds: [Float]!
  }

  type User @cacheControl(scope: PRIVATE) {
    _id: ID!
    email: String!
    name: String!
    staff: Boolean!
    student: Boolean!
    majors: [String!]!
    minors: [String!]!
    monitoredClasses: [MonitoredClass!]!
    notificationsOn: Boolean!
  }

  """
  Minimal user data point for analytics
  """
  type UserCreationDataPoint @cacheControl(maxAge: 0) {
    "Timestamp when the user was created"
    createdAt: String!
  }

  """
  User activity data point for analytics (tracks login activity)
  """
  type UserActivityDataPoint @cacheControl(maxAge: 0) {
    "Timestamp when the user was last seen (logged in)"
    lastSeenAt: String!
    "Timestamp when the user was created"
    createdAt: String!
  }

  type Query {
    user: User @auth
  }

  input MonitoredClassRefInput {
    year: Int!
    semester: Semester!
    sessionId: SessionIdentifier
    subject: String!
    courseNumber: CourseNumber!
    number: ClassNumber!
  }

  input MonitoredClassInput {
    class: MonitoredClassRefInput!
    thresholds: [Float!]!
  }

  input UpdateUserInput {
    majors: [String!]
    minors: [String!]
    monitoredClasses: [MonitoredClassInput!]
    notificationsOn: Boolean
  }

  type Mutation {
    updateUser(user: UpdateUserInput!): User @auth
    deleteAccount: Boolean @auth
  }
`;
