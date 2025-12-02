import { gql } from "graphql-tag";

export const collectionTypeDef = gql`
  enum CollectionColor {
    red
    orange
    amber
    yellow
    lime
    green
    emerald
    teal
    cyan
    sky
    blue
    indigo
    violet
    purple
    fuchsia
    pink
    rose
  }

  type Collection {
    _id: ID!
    createdBy: String!
    name: String!
    color: CollectionColor
    pinnedAt: String
    classes: [CollectionClass!]!
    createdAt: String!
    updatedAt: String!
  }

  type CollectionClass {
    class: Class
    error: String
  }

  type Query {
    myCollections: [Collection!]! @auth
    myCollection(name: String!): Collection @auth
    myCollectionById(id: ID!): Collection @auth
  }

  input AddClassInput {
    collectionName: String!
    year: Int!
    semester: Semester!
    sessionId: SessionIdentifier!
    subject: String!
    courseNumber: CourseNumber!
    classNumber: ClassNumber!
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

  input UpdateCollectionInput {
    name: String
    color: CollectionColor
    pinned: Boolean
  }

  type Mutation {
    updateCollection(name: String!, input: UpdateCollectionInput!): Collection!
      @auth
    deleteCollection(name: String!): Boolean! @auth
    addClassToCollection(input: AddClassInput!): Collection! @auth
    removeClassFromCollection(input: RemoveClassInput!): Collection! @auth
  }
`;
