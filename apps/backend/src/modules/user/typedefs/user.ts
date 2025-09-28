import { gql } from "graphql-tag";

const typedef = gql`
  type classPref {
    class: Class!
    thresholds: [Float]!
  }

  enum NotificationType {
    Email
    Mobile
    Off
  }
    
  type User @cacheControl(scope: PRIVATE) {
    _id: ID!
    email: String!
    name: String!
    student: Boolean!
    bookmarkedCourses: [Course!]!
    bookmarkedClasses: [Class!]!
    classPreferences: [classPref]
		notificationType: NotificationType!
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
