import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace ChatModule {
  interface DefinedFields {
    Message: '_id' | 'content' | 'user';
    Query: 'getMessages';
    Mutation: 'sendMessage';
  };
  
  export type Message = Pick<Types.Message, DefinedFields['Message']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  
  export type MessageResolvers = Pick<Types.MessageResolvers, DefinedFields['Message'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  
  export interface Resolvers {
    Message?: MessageResolvers;
    Query?: QueryResolvers;
    Mutation?: MutationResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Message?: {
      '*'?: gm.Middleware[];
      _id?: gm.Middleware[];
      content?: gm.Middleware[];
      user?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      getMessages?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      sendMessage?: gm.Middleware[];
    };
  };
}