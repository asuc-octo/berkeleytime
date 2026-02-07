import { gql } from "graphql-tag";

export const commentsTypeDef = gql`
  """
  A single comment in a class discussion
  """
  type Comment @cacheControl(maxAge: 1) {
    id: ID!
    "Comment body / text content"
    body: String!
    "User id of the author"
    authorId: String!
    "Display name of the author"
    authorName: String!
    "When the comment was created (ISO string)"
    createdAt: String!
    "When the comment was last updated (ISO string)"
    updatedAt: String
    "Parent comment id for replies; null for top-level comments"
    parentId: ID
    "Class identifier"
    year: Int!
    semester: Semester!
    subject: String!
    courseNumber: String!
    classNumber: String!
  }

  """
  Comments for a class (aggregated by class identifiers)
  """
  type ClassComments @cacheControl(maxAge: 1) {
    year: Int!
    semester: Semester!
    subject: String!
    courseNumber: String!
    classNumber: String!
    comments: [Comment!]!
  }

  input CreateCommentInput {
    body: String!
    year: Int!
    semester: Semester!
    subject: String!
    courseNumber: String!
    classNumber: String!
    parentId: ID
  }

  type Query {
    "Comments for a specific class"
    commentsForClass(
      year: Int!
      semester: Semester!
      subject: String!
      courseNumber: String!
      classNumber: String!
    ): ClassComments!
  }

  type Mutation {
    createComment(input: CreateCommentInput!): Comment! @auth
    deleteComment(id: ID!): Boolean! @auth
  }
`;
