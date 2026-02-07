import { gql } from "graphql-tag";

export const discussionTypeDef = gql`
  type Comment {
    _id: ID!
    courseId: CourseIdentifier!
    userId: ID!
    comment: String!
    createdAt: ISODate!
    updatedAt: ISODate!
  }

  type Query {
    """
    Retrieve all comments for a specific course. Optionally filter by user.
    """
    comments(courseId: CourseIdentifier!, userId: ID): [Comment!]!
  }

  type Mutation {
    """
    Add a new comment for a course.
    """
    addComment(courseId: CourseIdentifier!, comment: String!): Comment! @auth
  }
`;
