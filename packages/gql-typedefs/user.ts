import { gql } from "graphql-tag";

export const userTypeDef = gql`
  type User @cacheControl(scope: PRIVATE) {
    _id: ID!
    email: String!
    name: String!
    staff: Boolean!
    student: Boolean!
    majors: [String!]!
    minors: [String!]!
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

  """
  Active users count for a single time period bucket
  """
  type ActiveUsersDataPoint @cacheControl(maxAge: 0) {
    "Start of the time period (ISO string)"
    periodStart: String!
    "Number of active users whose lastSeenAt falls in this period"
    count: Int!
  }

  type Query {
    user: User @auth
  }

  input UpdateUserInput {
    majors: [String!]
    minors: [String!]
  }

  type Mutation {
    updateUser(user: UpdateUserInput!): User @auth
    deleteAccount: Boolean @auth
  }
`;
