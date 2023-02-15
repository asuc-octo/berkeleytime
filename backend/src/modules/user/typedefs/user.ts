import { gql } from "graphql-tag";

const typedef = gql`
  type User {
    id: String!
    google_id: String
    email: String
  }

  type Query {
    users: [User]
  }
`;

export default typedef;
