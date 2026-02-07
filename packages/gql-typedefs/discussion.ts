import { gql } from "graphql-tag";

export const discussionTypeDefs = gql`
  type Comment {
    id: ID!
    courseId: String!
    userId: String!
    content: String!
    createdAt: String!
  }

  type Query {
    courseComments(courseId: String!, userId: String): [Comment!]!
  }

  type Mutation {
    addCourseComment(
      courseId: String!
      content: String!
    ): Comment!
  }
`;
