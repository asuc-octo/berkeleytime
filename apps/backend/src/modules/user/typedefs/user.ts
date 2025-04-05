import { gql } from "graphql-tag";

const typedef = gql`
  type User {
    _id: ID!
    email: String!
    name: String!
    student: Boolean!
    bookmarkedCourses: [Course!]!
    bookmarkedClasses: [Class!]!
  }

  type Query {
    user: User @auth
  }

  input BookmarkedCourseInput {
    subject: String!
    number: CourseNumber!
  }

  input BookmarkedClassInput {
    year: Int!
    semester: Semester!
    sessionId: SessionIdentifier
    subject: String!
    courseNumber: CourseNumber!
    number: ClassNumber!
  }

  input UpdateUserInput {
    bookmarkedClasses: [BookmarkedClassInput!]
    bookmarkedCourses: [BookmarkedCourseInput!]
  }

  type Mutation {
    updateUser(user: UpdateUserInput!): User @auth
  }
`;

export default typedef;
