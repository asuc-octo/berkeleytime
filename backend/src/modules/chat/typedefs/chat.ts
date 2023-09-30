import { gql } from "graphql-tag";

export default gql`
type Query {
    allMessages(created_by: String): [Message]
}

type Mutation {
    createMessage(message: MessageInput!): Message
}

"""
Each message
"""
type Message {
    body: String!
    timestamp: ISODate!
}

input MessageInput {
    body: String!
    created_by: String!
}
`;