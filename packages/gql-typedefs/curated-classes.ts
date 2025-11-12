import { gql } from "graphql-tag";

export const curatedClassesTypeDef = gql`
  type CuratedClass @cacheControl(maxAge: 1) {
    _id: ID!

    class: Class!

    semester: Semester!
    year: Int!
    sessionId: SessionIdentifier!
    courseNumber: CourseNumber!
    number: ClassNumber!
    subject: String!

    createdAt: String!
    updatedAt: String!

    publishedAt: String
    createdBy: ID!

    image: String!
    text: String!
  }

  type Query {
    curatedClasses: [CuratedClass!]!
    curatedClass(id: ID!): CuratedClass @auth
  }

  input CreateCuratedClassInput {
    semester: Semester!
    year: Int!
    sessionId: SessionIdentifier!
    courseNumber: CourseNumber!
    number: ClassNumber!
    subject: String!

    image: String!
    text: String!
  }

  input UpdateCuratedClassInput {
    image: String
    text: String

    semester: Semester
    year: Int
    sessionId: SessionIdentifier
    courseNumber: CourseNumber
    number: ClassNumber
    subject: String
  }

  type Mutation {
    createCuratedClass(curatedClass: CreateCuratedClassInput!): CuratedClass
      @auth
    updateCuratedClass(
      id: ID!
      curatedClass: UpdateCuratedClassInput!
    ): CuratedClass @auth
    deleteCuratedClass(id: ID!): ID! @auth
  }
`;
