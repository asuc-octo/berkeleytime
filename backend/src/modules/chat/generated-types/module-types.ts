import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace ChatModule {
    interface DefinedFields {
      Message: 'text' | 'sender' | 'timestamp';
      Query: 'messageByUser';
      Mutation: 'createMessage';
    };

    interface DefinedInputFields {
        MessageInput: 'text' | 'sender';
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
          text?: gm.Middleware[];
          sender?: gm.Middleware[];
        };
        Query?: {
          '*'?: gm.Middleware[];
          messageByUser?: gm.Middleware[];
        };
        Mutation?: {
          '*'?: gm.Middleware[];
          createMessage?: gm.Middleware[];
        };
      };
}