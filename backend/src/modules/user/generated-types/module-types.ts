import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace UserModule {
  interface DefinedFields {
    User: 'name' | 'google_id' | 'email' | 'majors' | 'classes_saved' | 'schedules';
    Query: 'User';
  };
  
  export type User = Pick<Types.User, DefinedFields['User']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  
  export type UserResolvers = Pick<Types.UserResolvers, DefinedFields['User'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  
  export interface Resolvers {
    User?: UserResolvers;
    Query?: QueryResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    User?: {
      '*'?: gm.Middleware[];
      name?: gm.Middleware[];
      google_id?: gm.Middleware[];
      email?: gm.Middleware[];
      majors?: gm.Middleware[];
      classes_saved?: gm.Middleware[];
      schedules?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      User?: gm.Middleware[];
    };
  };
}