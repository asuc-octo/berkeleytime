import { gql } from "graphql-tag";

export const discussionTypeDef = gql`
  type DiscussionComment @cacheControl(maxAge: 0) {
    id: ID!
    courseId: CourseIdentifier!
    subject: String!
    courseNumber: CourseNumber!
    createdBy: String!
    comment: String!
    createdAt: String!
    updatedAt: String!
  }

  input CreateCourseCommentInput {
    subject: String!
    courseNumber: CourseNumber!
    comment: String!
  }

  type Query {
    courseComments(
      subject: String!
      courseNumber: CourseNumber!
      createdBy: String
    ): [DiscussionComment!]!
  }

  type Mutation {
    createCourseComment(input: CreateCourseCommentInput!): DiscussionComment!
      @auth
  }
`;
