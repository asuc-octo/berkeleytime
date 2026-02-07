import { gql } from "graphql-tag";

export const discussionTypeDef = gql`
  """
  A discussion entry (comment) on a course.
  """
  type CourseDiscussion @cacheControl(maxAge: 1) {
    _id: ID!
    timestamp: ISODate!
    userId: ID!
    courseId: CourseIdentifier!
    comment: String!
  }

  type Query {
    "Get all discussion entries for a course, ordered by timestamp (newest first or oldest first as needed). Requires authentication."
    courseDiscussions(courseId: CourseIdentifier!): [CourseDiscussion!]! @auth
  }

  type Mutation {
    "Add a comment to a course. Requires authentication."
    addCourseDiscussion(
      courseId: CourseIdentifier!
      comment: String!
    ): CourseDiscussion! @auth
    "Delete a discussion entry by ID. Caller must be the author or staff."
    deleteCourseDiscussion(id: ID!): Boolean! @auth
  }
`;
