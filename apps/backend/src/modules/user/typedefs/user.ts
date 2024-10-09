import { gql } from "graphql-tag";

const typedef = gql`
  type User {
    email: String!
    student: Boolean!
  }

  type Query {
    user: User @auth
  }
`;

export default typedef;
