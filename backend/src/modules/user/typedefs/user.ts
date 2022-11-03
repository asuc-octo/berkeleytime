import { gql } from "apollo-server-express";

const typedef = gql`
  type User {
    id: String!
    google_id: String!
    email: String!
  }

  type Query {
    User(google_id: String!): User
  }
`;

export default typedef;
