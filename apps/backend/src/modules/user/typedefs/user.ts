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
    staff: Boolean!
    student: Boolean!
    bookmarkedCourses: [Course!]!
    bookmarkedClasses: [Class!]!
    monitoredClasses: [MonitoredClass!]!
    notificationsOn: Boolean!
    majors: [String!]!
    minors: [String!]!
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

  input MonitoredClassRefInput {
    year: Int!
    semester: Semester!
    sessionId: SessionIdentifier
    subject: String!
    courseNumber: CourseNumber!
    number: ClassNumber!
  }

  input MonitoredClassInput {
    class: MonitoredClassRefInput!
    thresholds: [Float!]!
  }

  input UpdateUserInput {
    bookmarkedClasses: [BookmarkedClassInput!]
    bookmarkedCourses: [BookmarkedCourseInput!]
    monitoredClasses: [MonitoredClassInput!]
    notificationsOn: Boolean!
    majors: [String!]
    minors: [String!]
  }

  type Mutation {
    updateUser(user: UpdateUserInput!): User @auth
  }
`;

export default typedef;
