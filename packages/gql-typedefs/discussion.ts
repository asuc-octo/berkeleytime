import { gql } from "graphql-tag";

export const discussionTypeDef = gql`
  """
  A comment posted by a user on a course
  """
  type CourseComment @cacheControl(scope: PRIVATE) {
    _id: ID!
    courseId: CourseIdentifier!
    author: User!
    content: String!
    createdAt: String!
  }

  input AddCourseCommentInput {
    courseId: CourseIdentifier!
    content: String!
  }

  type Query {
    courseComments(courseId: CourseIdentifier!): [CourseComment!]!
  }

  type Mutation {
    addCourseComment(input: AddCourseCommentInput!): CourseComment! @auth
  }
`;
