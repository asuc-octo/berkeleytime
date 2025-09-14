import { gql } from "graphql-tag";

export default gql`
  """
  A comment made by a user about a specific subject
  """
  type DiscussionComment @cacheControl(maxAge: 60, scope: PUBLIC) {
    id: ID!
    subject: String!
    userId: String!
    content: String!
    createdAt: ISODate!
    updatedAt: ISODate!
  }

  """
  Input for creating a new discussion comment
  """
  input CreateDiscussionCommentInput {
    subject: String!
    content: String!
  }

  """
  Input for filtering discussion comments
  """
  input DiscussionCommentFilter {
    subject: String
    userId: String
  }

  extend type Query {
    """
    Retrieve all comments filtered by subject and/or user
    """
    discussionComments(
      filter: DiscussionCommentFilter
      limit: Int
      offset: Int
    ): [DiscussionComment!]! @cacheControl(maxAge: 30, scope: PUBLIC)
  }

  extend type Mutation {
    """
    Add a new comment for a subject
    """
    createDiscussionComment(
      input: CreateDiscussionCommentInput!
    ): DiscussionComment! @auth @cacheControl(maxAge: 0)
  }
`;
