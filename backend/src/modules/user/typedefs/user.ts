import { gql } from "apollo-server-express";

const typedef = gql`
  type User {
    name: String!
    google_id: String!
    email: String!
    majors: [String]
    classes_saved: [String]
    schedules: [String]
  }

  type Query {
    User(google_id: String!): User
  }
`;

export default typedef;
