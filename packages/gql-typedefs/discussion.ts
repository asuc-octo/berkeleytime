import { gql } from "graphql-tag";

export const discussionTypeDef = gql`
  """
  A comment posted by a user on a course
  """
  type CourseComment @cacheControl(scope: PRIVATE) {
    _id: ID!
    "The course this comment belongs to"
    courseId: CourseIdentifier!
    "The user who wrote the comment"
    author: User!
    "The comment text content"
    content: String!
    "When the comment was created"
    createdAt: String!
  }

  input AddCourseCommentInput {
    courseId: CourseIdentifier!
    content: String!
  }

  type Query {
    "Retrieve all comments for a specific course"
    courseComments(courseId: CourseIdentifier!): [CourseComment!]!
  }

  type Mutation {
    "Add a new comment for the authenticated user on a course"
    addCourseComment(input: AddCourseCommentInput!): CourseComment! @auth
  }
`;
