import { gql } from "graphql-tag";

export const collectionTypeDef = gql`
  type Collection {
    _id: ID!
    createdBy: String!
    name: String!
    classes: [CollectionClass!]!
    createdAt: String!
    updatedAt: String!
  }

  type CollectionClass {
    class: Class
    personalNote: PersonalNote
    error: String
  }

  type PersonalNote {
    text: String!
    updatedAt: String!
  }

  type Query {
    myCollections: [Collection!]! @auth
    myCollection(name: String!): Collection @auth
  }

  input AddClassInput {
    collectionName: String!
    year: Int!
    semester: Semester!
    sessionId: SessionIdentifier!
    subject: String!
    courseNumber: CourseNumber!
    classNumber: ClassNumber!
    personalNote: PersonalNoteInput
  }

  input PersonalNoteInput {
    text: String!
  }

  input RemoveClassInput {
    collectionName: String!
    year: Int!
    semester: Semester!
    sessionId: SessionIdentifier!
    subject: String!
    courseNumber: CourseNumber!
    classNumber: ClassNumber!
  }

  type Mutation {
    renameCollection(oldName: String!, newName: String!): Collection! @auth
    deleteCollection(name: String!): Boolean! @auth
    addClassToCollection(input: AddClassInput!): Collection! @auth
    removeClassFromCollection(input: RemoveClassInput!): Collection! @auth
  }
`;
