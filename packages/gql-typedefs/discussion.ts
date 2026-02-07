import { gql } from "graphql-tag";

export const commentsTypeDef = gql`
  """
  A single comment in a class discussion
  """
  type Comment @cacheControl(maxAge: 1) {
    id: ID!
    body: String!
    authorId: String!
    authorName: String!
    createdAt: String!
    updatedAt: String
    parentId: ID
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
