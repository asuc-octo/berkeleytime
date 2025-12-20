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
    lastAdd: String!
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

  """
  Collection creation data point for analytics
  """
  type CollectionCreationDataPoint @cacheControl(maxAge: 0) {
    "Timestamp when the user's first collection was created"
    createdAt: String!
    "User ID"
    userId: String!
  }

  """
  Class addition data point for analytics
  """
  type ClassAdditionDataPoint @cacheControl(maxAge: 0) {
    "Timestamp when the class was added"
    addedAt: String!
    "User ID"
    userId: String!
  }

  """
  Collection highlights for quick stats
  """
  type CollectionHighlights @cacheControl(maxAge: 0) {
    "Largest collection class count"
    largestCollectionSize: Int!
    "Largest custom collection class count"
    largestCustomCollectionSize: Int!
    "Largest custom collection name"
    largestCustomCollectionName: String
    "Most bookmarked course identifier"
    mostBookmarkedCourse: String
    "Most bookmarked course count"
    mostBookmarkedCourseCount: Int!
    "Most collections by a single user"
    mostCollectionsByUser: Int!
  }

  """
  Collection analytics data
  """
  type CollectionAnalyticsData @cacheControl(maxAge: 0) {
    "User first collection creation timestamps"
    collectionCreations: [CollectionCreationDataPoint!]!
    "Class addition timestamps"
    classAdditions: [ClassAdditionDataPoint!]!
    "Custom (non-system) collection creation timestamps"
    customCollectionCreations: [CollectionCreationDataPoint!]!
    "Unique users with custom collections (first custom collection per user)"
    usersWithCustomCollections: [CollectionCreationDataPoint!]!
    "Highlights and top stats"
    highlights: CollectionHighlights!
  }

  extend type Query {
    "Staff-only: Collection analytics data"
    collectionAnalyticsData: CollectionAnalyticsData! @auth
  }
`;
