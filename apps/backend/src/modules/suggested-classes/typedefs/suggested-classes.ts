import { gql } from "graphql-tag";

const typedef = gql`
  type Post {
    id: ID!

    class: Class!

    semester: Semester!
    year: Int!
    sessionId: SessionIdentifier!
    courseNumber: CourseNumber!
    number: ClassNumber!
    subject: String!

    image: String!
    text: String!
  }

  type Query {
    posts: [Post!]!
    post(id: ID!): Post
  }

  input CreatePostInput {
    semester: Semester!
    year: Int!
    sessionId: SessionIdentifier
    courseNumber: CourseNumber!
    number: ClassNumber!
    subject: String!

    image: String!
    text: String!
  }

  input UpdatePostInput {
    image: String
    text: String
  }

  type Mutation {
    createPost(post: CreatePostInput!): Post
    updatePost(id: ID!, post: UpdatePostInput!): Post
    deletePost(id: ID!): Boolean
  }
`;

export default typedef;
