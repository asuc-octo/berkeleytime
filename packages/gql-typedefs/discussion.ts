import { gql } from "graphql-tag";

export const discussionTypeDef = gql`
  type Comment {
    id: ID!
    subject: String!
    courseNumber: String!
    userEmail: String!
    text: String!
    timestamp: String!
  }

  extend type Query {
    """
    Retrieve all comments for a specific course
    """
    getComments(
      subject: String!
      courseNumber: String!
      userEmail: String
    ): [Comment!]!
  }

  extend type Mutation {
    """
    Add a new comment for a course
    """
    postComment(
      subject: String!
      courseNumber: String!
      text: String!
    ): Comment!
  }
`;