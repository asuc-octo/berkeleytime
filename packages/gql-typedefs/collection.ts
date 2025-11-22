import { gql } from "graphql-tag";

export const collectionTypeDef = gql`
  type Collection {
    ownerID: String!
    viewerID: [String!]!
    name: String!
    classes: [CollectionClass!]!
  }

  type CollectionClass {
    info: Class!
    comments: [String!]!
  }

  type Query {
    ownerCollection(
        ownerID: String!
    ): [Collection!]!
    viewerCollection(
        viewerID: String!
    ): [Collection!]!
  }
    
  input CollectionClassInput {
    year: Int!
    semester: Semester!
    sessionId: SessionIdentifier
    subject: String!
    courseNumber: CourseNumber!
    number: ClassNumber!
  }

  input CreateCollectionInput {
    ownerID: String!
    name: String!
  }

  input AddCollectionClassInput {
    ownerID: String!
    name: String!
    class: CollectionClassInput!
  }

  input modifyCollectionCommentInput {
    ownerID: String!
    name: String!
    class: CollectionClassInput!
    comment: String!
    add: Boolean!
  }

  type Mutation {
    createCollection(input: CreateCollectionInput!): Collection!
    addClassToCollection(input: AddCollectionClassInput!): Collection!
    addCommentToCollectionClass(input: modifyCollectionCommentInput!): Collection!
    deleteCommentFromCollectionClass(input: modifyCollectionCommentInput!): Collection!
  }
`;
