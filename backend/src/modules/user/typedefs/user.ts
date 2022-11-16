import { gql } from "apollo-server-express";

const typedef = gql`
  type User {
    id: String!
    password: String!
    last_login: String
    is_superuser: Boolean!
    username: String!
    first_name: String!
    last_name: String!
    email: String!
    is_staff: Boolean!
    is_active: Boolean!
    date_joined: String!
    major: [String],
    email_class_update: Boolean,
    email_grade_update: Boolean,
    email_enrollment_opening: Boolean,
    email_berkeleytime_update: Boolean
  }

  type Query {
    User(id: String!): User
  }
`;

export default typedef;
