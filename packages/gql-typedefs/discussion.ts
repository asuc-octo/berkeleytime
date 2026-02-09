import { gql } from "graphql-tag";

export const discussionTypeDef = gql`
  """
  Comment on a course
  """
  type Comment @cacheControl(maxAge: 1) {
    _id: ID!
    courseId: String!
    createdBy: String!
    text: String!
    createdAt: String!
  }

  """
  Get data
  """
  type Query {
    comments(courseId: String!): [Comment!]!
  }

  """
  Modify data
  """
  type Mutation {
    createComment(courseId: String!, text: String!): Boolean! @auth
  }
`;
