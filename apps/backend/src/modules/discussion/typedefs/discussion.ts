import {gql} from "graphql-tag";

const typedef = gql`
  """
  Discussion comments by course
  """
  type DiscussionItem @cacheControl(maxAge: 0, scope: PRIVATE) {
    "Course identifier"
    courseSubject: String!
    courseNumber: String!

    comments: [Comment!]!
  }

  type Comment {
    userId: String!
    comment: String!
    timestamp: String!
  }

  type Query {
    discussions(courseSubject: String!, courseNumber: String!): [Comment!]!
  }

  type Mutation {
    createComment(courseSubject: String!, courseNumber: String!, userId: String!, comment: String!, timestamp: String!): DiscussionItem
  }
`;

export default typedef;