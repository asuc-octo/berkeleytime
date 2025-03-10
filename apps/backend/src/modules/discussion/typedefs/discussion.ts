// discussion/typedefs/discussion.ts – GraphQL schema
import { gql } from "graphql-tag";

export default gql`
  type Discussion {
    text: String!
    userId: String!
    courseId: String!
    timestamp: String!
  }

  # Query type used to fetch data from server
  type Query {
    getDiscussionsByCourse(courseId: String!): [Discussion]
    filterDiscussionsByUser(userId: String!): [Discussion]
  }

  # Mutation types modifies data
  type Mutation {
    addDiscussion(courseId: String!, text: String!): Discussion
  }
`;
