import { gql } from "graphql-tag";

const typedef = gql`
  directive @auth on OBJECT

  """
  User accout info.
  """
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

  """
  User input type for mutations.
  """
  input UserInput {
    username: String
    first_name: String
    last_name: String
    major: [String!]
    email_class_update: Boolean
    email_grade_update: Boolean
    email_enrollment_opening: Boolean
    email_berkeleytime_update: Boolean
  }

  type Query @auth {
    """
    Query for user info.
    """
    User: User
  }

  type Mutation @auth {
    """
    Mutate user info.
    """
    UpdateUserInfo(newUserInfo: UserInput!): User

    """
    Delete user account.
    """
    DeleteUser: User
  }
`;

export default typedef;
