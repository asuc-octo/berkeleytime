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

  type Query {
    user: User @auth
    "Staff-only: User creation timestamps for analytics"
    userCreationAnalyticsData: [UserCreationDataPoint!]! @auth
  }

  input UpdateUserInput {
    majors: [String!]
    minors: [String!]
  }

  type Mutation {
    updateUser(user: UpdateUserInput!): User @auth
  }
`;
