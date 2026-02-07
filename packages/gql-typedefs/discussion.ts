import { gql } from "graphql-tag";

export const discussionTypeDef = gql`
  type Comment {
    id: ID!
    courseId: CourseIdentifier!
    createdBy: String!
    body: String!
    createdAt: String!
  }

  type Query {
    courseComments(courseId: CourseIdentifier!, userId: String): [Comment!]!
      @cacheControl(maxAge: 0)
  }

  type Mutation {
    addCourseComment(courseId: CourseIdentifier!, body: String!): Comment! @auth
  }
`;
