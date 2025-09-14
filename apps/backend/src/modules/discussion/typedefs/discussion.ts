import { gql } from "graphql-tag";

export default gql`
  scalar DiscussionIdentifier

  type Query {
    discussionsByClass(
      year: Int!
      semester: Semester!
      sessionId: SessionIdentifier
      subject: String!
      courseNumber: CourseNumber!
      classNumber: ClassNumber!
    ): [Discussion!]!

    discussionsByUser(userId: String!): [Discussion!]!
  }

  type Mutation {
    addDiscussion(
      year: Int!
      semester: Semester!
      sessionId: SessionIdentifier
      subject: String!
      courseNumber: CourseNumber!
      classNumber: ClassNumber!
      content: String!
    ): Discussion!

    deleteDiscussion(discussionId: DiscussionIdentifier!): Boolean!
  }

  type Discussion {
    discussionId: DiscussionIdentifier!
    classId: String!
    class: Class!
    userId: String!
    user: User
    content: String!
    timestamp: String!
    parentId: DiscussionIdentifier
  }
`;
