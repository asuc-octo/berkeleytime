import { gql } from "graphql-tag";

const typeDef = gql`
  type Comment {
    _id: ID!
    createdBy: String!
    subject: String!
    courseNumber: String!
    classNumber: String!
    year: Int!
    semester: Semester!
    value: String!
  }

  type AggregatedComments {
    comments: [Comment!]!
    total: Int!
  }

  type Query {
    aggregatedComments(
      year: Int!
      semester: Semester!
      subject: String!
      courseNumber: String!
      classNumber: String!
    ): AggregatedComments!
  }

  type Mutation {
    createComment(
      year: Int!
      semester: Semester!
      subject: String!
      courseNumber: String!
      classNumber: String!
      value: String!
    ): Boolean!
  }
`;

export default typeDef;