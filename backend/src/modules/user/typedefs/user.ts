import { gql } from "graphql-tag";

const typedef = gql`
  directive @auth on OBJECT

  type User {
    email: String!
    username: String!
    first_name: String!
    last_name: String!
    major: [String!]!
    last_login: String!
    date_joined: String!
    is_staff: Boolean!
    is_active: Boolean!
    email_class_update: Boolean!
    email_grade_update: Boolean!
    email_enrollment_opening: Boolean!
    email_berkeleytime_update: Boolean!
  }

  type Query @auth {
    User: User
  }

  type Mutation @auth {
    UpdateUserInfo(username: String, first_name: String, last_name: String): User
    UpdateUserMajor(major: [String!]): User
    UpdateUserEmailPreferences(email_class_update: Boolean, email_grade_update: Boolean, email_enrollment_opening: Boolean, email_berkeleytime_update: Boolean): User
    DeleteUser: User
  }
`;

export default typedef;
