import { gql } from "graphql-tag";

const typedef = gql`
  type MonitoredClass {
    class: Class!
    thresholds: [Float]!
  }

  type User @cacheControl(scope: PRIVATE) {
    _id: ID!
    email: String!
    name: String!
    student: Boolean!
    bookmarkedCourses: [Course!]!
    bookmarkedClasses: [Class!]!
    monitoredClasses: [MonitoredClass!]!
    notificationsOn: Boolean!
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

  input MonitoredClassInput {
    class: BookmarkedClassInput!
    thresholds: [Float!]!
  }

  input UpdateUserInput {
    bookmarkedClasses: [BookmarkedClassInput!]
    bookmarkedCourses: [BookmarkedCourseInput!]
    monitoredClasses: [MonitoredClassInput!]
    notificationsOn: Boolean!
  }

  type Mutation {
    updateUser(user: UpdateUserInput!): User @auth
  }
`;

export default typedef;
