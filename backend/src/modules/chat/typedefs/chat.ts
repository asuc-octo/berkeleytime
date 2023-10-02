import {gql} from 'graphql-tag';

const typeDef = gql`


    """
    MessageInput Info
    """
    type MessageInput {
        text: String!
        sender: String!
    }

    """
    Message info
    """
    type Message {
        text: String!
        sender: String!
        timestamp: ISODate!
    }


    type Query {
        // note that it is ok if you don't give user, this would just give all message
        messageByUser(sender: String): [Message]
    }

    type Mutation {
        createMessage(message: MessageInput!): Message
    }


`

export default typeDef;