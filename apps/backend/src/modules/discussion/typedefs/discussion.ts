import { gql } from "graphql-tag";


const typeDef = gql`
  type Comment {
    id: ID!
    courseId: String!
    userId: String!
    text: String!
    createdAt: String!
  }


  type Query {
    commentsByCourse(courseId: String!, userId: String): [Comment!]!
  }

  type Mutation {
    addComment(courseId: String!, userId: String!, text: String!): Comment!
  }
`;

export default typeDef;