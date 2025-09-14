import { gql } from "graphql-tag";

export default gql`
  type Query {
    discussion(
      subject: String!
      courseNumber: CourseNumber!
    ): Discussion
  }

  type Mutation {
    createComment(
      subject: String!
      courseNumber: CourseNumber!
      comment: String!
    ): Boolean! @auth
  } 

  type Discussion {
    "Identifiers"
    subject: String!
    courseNumber: CourseNumber!

    "Attributes"
    comment: String!
    createdBy: String!
  }
`;
