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
    ownerCollection(ownerID: String!): [Collection!]!
    viewerCollection(viewerID: String!): [Collection!]!
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

  input ModifyCollectionClassInput {
    ownerID: String!
    name: String!
    class: CollectionClassInput!
    add: Boolean!
  }

  input ModifyCollectionCommentInput {
    ownerID: String!
    name: String!
    class: CollectionClassInput!
    comment: String!
    add: Boolean!
  }

  type Mutation {
    createCollection(input: CreateCollectionInput!): Collection!
    modifyCollectionClass(input: ModifyCollectionClassInput!): Collection!
    modifyCollectionComment(input: ModifyCollectionCommentInput!): Collection!
  }
`;
