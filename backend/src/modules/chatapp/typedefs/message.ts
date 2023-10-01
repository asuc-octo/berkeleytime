import { gql } from "graphql-tag";

const typedef = gql`
  """
  Message schema for graphql 
  """
  type Message {
    sender: String!
    receiver: String!
    message: String!
  }

  input MessageInput {
    sender: String
  }

  """
  Outlines the query functions, their parameters, and their return types
  """
  type Query {
    getMessages(input: MessageInput!): [Message]
  }

  """
  Outlines the mutation functions, their parameters, and their return types
  """
  type Mutation {
    sendMessage(sender: String!, receiver: String!, message: String!): Message
  }
`;

export default typedef;
