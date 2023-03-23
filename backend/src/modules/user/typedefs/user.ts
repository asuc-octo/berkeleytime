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

  type Query @auth {
    """
    Query for user info.
    """
    User: User
  }

  type Mutation @auth {
    """
    Mutate username, first name, and last name.
    """
    UpdateUserInfo(username: String, first_name: String, last_name: String): User

    """
    Mutate major.
    """
    UpdateUserMajor(major: [String!]): User

    """
    Mutate email preferences.
    """
    UpdateUserEmailPreferences(email_class_update: Boolean, email_grade_update: Boolean, email_enrollment_opening: Boolean, email_berkeleytime_update: Boolean): User

    """
    Delete user account.
    """
    DeleteUser: User
  }
`;

export default typedef;
