import { gql } from 'graphql-tag';

const typedef = gql`

    type Message {
        _id: ID!
        content: String!
        user: String!
    }

    type Query {
        """
        Returns all messages, optionally filtered by a user ID (email)
        """
        getMessages(user: String): [Message]
    }

    type Mutation {
        """
        Send (create) a message containing some content from a user with a given ID (email). Returns the message that was sent.
        """
        sendMessage(user: String!, content: String!): Message!
    }
`

export default typedef;
