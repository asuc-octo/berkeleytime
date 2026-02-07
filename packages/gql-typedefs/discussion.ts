import { gql } from "graphql-tag";

export const discussionTypeDef = gql`
  """
  Comment on a course
  """
  type Comment @cacheControl(maxAge: 1) {
    "Unique identifier"
    _id: ID!
    "Course identifier"
    courseId: String!
    "User ID who created the comment"
    createdBy: String!
    "Comment text content"
    text: String!
    "Timestamp when comment was created"
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
