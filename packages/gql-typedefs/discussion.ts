import { gql } from "graphql-tag";

export const discussionTypeDef = gql`
  """
  A comment on a course discussion board
  """
  type CourseComment {
    id: ID!
    content: String!
    createdBy: String!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    courseComments(
      subject: String!
      courseNumber: String!
      userId: String
    ): [CourseComment!]!
  }

  type Mutation {
    addCourseComment(
      subject: String!
      courseNumber: String!
      content: String!
    ): CourseComment!
  }
`;
