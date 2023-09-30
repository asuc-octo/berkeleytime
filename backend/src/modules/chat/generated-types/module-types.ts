import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace ChatModule {
  interface DefinedFields {
    Query: 'allMessages';
    Mutation: 'createMessage';
    Message: 'body' | 'timestamp';
  };
  
  interface DefinedInputFields {
    MessageInput: 'body' | 'created_by';
  };
  
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type Message = Pick<Types.Message, DefinedFields['Message']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  export type MessageInput = Pick<Types.MessageInput, DefinedInputFields['MessageInput']>;
  export type ISODate = Types.IsoDate;
  
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  export type MessageResolvers = Pick<Types.MessageResolvers, DefinedFields['Message'] | '__isTypeOf'>;
  
  export interface Resolvers {
    Query?: QueryResolvers;
    Mutation?: MutationResolvers;
    Message?: MessageResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      allMessages?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      createMessage?: gm.Middleware[];
    };
    Message?: {
      '*'?: gm.Middleware[];
      body?: gm.Middleware[];
      timestamp?: gm.Middleware[];
    };
  };
}