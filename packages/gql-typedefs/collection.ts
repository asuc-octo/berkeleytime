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

  type Collection @cacheControl(maxAge: 0) {
    _id: ID!
    createdBy: String!
    name: String!
    color: CollectionColor
    pinnedAt: String
    isSystem: Boolean!
    classes: [CollectionClass!]!
    createdAt: String!
    updatedAt: String!
  }

  type CollectionClass @cacheControl(maxAge: 0) {
    class: Class
    error: String
    addedAt: String
  }

  type Query {
    myCollections: [Collection!]! @auth
    myCollection(name: String!): Collection @auth
    myCollectionById(id: ID!): Collection @auth
  }

  input CreateCollectionInput {
    name: String!
    color: CollectionColor
  }

  input AddClassInput {
    collectionId: ID!
    year: Int!
    semester: Semester!
    sessionId: SessionIdentifier!
    subject: String!
    courseNumber: CourseNumber!
    classNumber: ClassNumber!
  }

  input RemoveClassInput {
    collectionId: ID!
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
    createCollection(input: CreateCollectionInput!): Collection! @auth
    updateCollection(id: ID!, input: UpdateCollectionInput!): Collection! @auth
    deleteCollection(id: ID!): Boolean! @auth
    addClassToCollection(input: AddClassInput!): Collection! @auth
    removeClassFromCollection(input: RemoveClassInput!): Collection! @auth
  }
`;
