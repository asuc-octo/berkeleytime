import { gql } from "graphql-tag";

export const adTargetTypeDef = gql`
  """
  Targeting rules for serving an advertisement.
  """
  type AdTarget @cacheControl(maxAge: 0) {
    id: ID!
    subjects: [String!]!
    minCourseNumber: String
    maxCourseNumber: String
    createdAt: String!
  }

  type Query {
    """
    Get all ad targets.
    """
    allAdTargets: [AdTarget!]! @auth
  }

  input CreateAdTargetInput {
    subjects: [String!]
    minCourseNumber: String
    maxCourseNumber: String
  }

  input UpdateAdTargetInput {
    subjects: [String!]
    minCourseNumber: String
    maxCourseNumber: String
  }

  type Mutation {
    createAdTarget(input: CreateAdTargetInput!): AdTarget! @auth
    updateAdTarget(adTargetId: ID!, input: UpdateAdTargetInput!): AdTarget!
      @auth
    deleteAdTarget(adTargetId: ID!): Boolean! @auth
  }
`;
