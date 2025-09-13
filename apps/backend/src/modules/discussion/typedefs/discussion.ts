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

  type Discussion @cacheControl(maxAge: 300) {
    "Identifiers"
    subject: String!
    courseNumber: CourseNumber!

    "Attributes"
    comments: [DiscussionComment!]!
  }

  type DiscussionComment {
    comment: String!
    createdBy: String!
  }
`;
