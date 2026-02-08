import { gql } from "graphql-tag";

export const discussionTypeDef = gql`
  """
  A user comment on a course
  """
  type DiscussionComment @cacheControl(maxAge: 60) {
    "Unique comment id"
    id: ID!
    "Course identifier (cs-course-id)"
    courseId: String!
    "User id of the comment author"
    createdBy: String!
    "Comment body text"
    body: String!
    "When the comment was created (ISO 8601)"
    createdAt: String!
    "When the comment was last updated (ISO 8601)"
    updatedAt: String!
  }

  type Query {
    "All comments for a course, optionally filtered by user"
    courseComments(courseId: String!, userId: String): [DiscussionComment!]!
  }

  type Mutation {
    "Add a new comment for a course"
    addCourseComment(courseId: String!, body: String!): DiscussionComment! @auth
  }
`;
