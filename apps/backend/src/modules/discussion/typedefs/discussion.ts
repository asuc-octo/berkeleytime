import { gql } from "graphql-tag";

export default gql`

  type Query {
    discussions(courseNumber: String!, email: String): [Discussion!]!
  }

  type Discussion {
    email: String!
    courseNumber: String!
    createdAt: String!
    content: String!
  } 
    
  type Mutation {
    addDiscussion(email: String!, courseNumber: String!, content: String!): Discussion!
  }
`;
