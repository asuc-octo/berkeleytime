import { gql } from "graphql-tag";

const typedef = gql`

  type Comment {
    _id: ID!
    createdBy: String!
    timestamp: String!
    text: String! 
    courseNumber: String! 
  }

  type Query {
    comments(courseNumber: String!, createdBy: String): [Comment!]!
  }

  input AddCommentInput {
    courseNumber: String!
    text: String!
    createdBy: String!
  }

  type Mutation {
    addComment(input: AddCommentInput!): Comment!
  }
`;

export default typedef;