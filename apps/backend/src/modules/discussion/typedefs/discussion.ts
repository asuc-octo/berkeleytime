import { gql } from "graphql-tag";

export default gql`
    type Discussion {
        id: ID!
        content: String!
        author: String!
        createdAt: String!
        classId: String!
    }

    type Query {
        discussionsByClass(classId: ID!): [Discussion!]!
        allDiscussions: [Discussion!]!
    }

    type Mutation {
        createDiscussion(content: String!, author: String!, classId: ID!): Discussion!
        deleteDiscussion(id: ID!): Boolean!
    }
`;