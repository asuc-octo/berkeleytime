import { gql } from "graphql-tag";

export const newMemberOnboardingTypeDef = gql`
  """
  A comment on a course by a user
  """
  type CourseComment @cacheControl(maxAge: 0) {
    "Unique identifier for the comment"
    id: ID!
    "Course identifier"
    courseId: String!
    "Course subject (e.g., CS, MATH)"
    subject: String!
    "Course number (e.g., 61A, 170)"
    courseNumber: String!
    "User ID of the commenter"
    userId: String!
    "Comment text content"
    text: String!
    "When the comment was created"
    createdAt: String!
    "When the comment was last updated"
    updatedAt: String!
  }

  """
  Input for adding a new course comment
  """
  input AddCourseCommentInput {
    "Course subject (e.g., CS, MATH)"
    subject: String!
    "Course number (e.g., 61A, 170)"
    courseNumber: String!
    "Comment text content"
    text: String!
  }

  """
  Get data
  """
  type Query {
    """
    Retrieve all comments for a specific course
    Optionally filter by user ID
    """
    courseComments(
      subject: String!
      courseNumber: String!
      userId: String
    ): [CourseComment!]!
  }

  """
  Modify data
  """
  type Mutation {
    """
    Add a new comment for a course
    Requires authentication
    """
    addCourseComment(input: AddCourseCommentInput!): CourseComment! @auth
  }
`;
