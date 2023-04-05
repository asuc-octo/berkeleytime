import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace UserModule {
  interface DefinedFields {
    User: 'email' | 'username' | 'first_name' | 'last_name' | 'major' | 'last_login' | 'date_joined' | 'is_staff' | 'is_active' | 'email_class_update' | 'email_grade_update' | 'email_enrollment_opening' | 'email_berkeleytime_update';
    Query: 'user';
    Mutation: 'updateUserInfo' | 'deleteUser';
  };
  
  interface DefinedInputFields {
    UserInput: 'username' | 'first_name' | 'last_name' | 'major' | 'email_class_update' | 'email_grade_update' | 'email_enrollment_opening' | 'email_berkeleytime_update';
  };
  
  export type User = Pick<Types.User, DefinedFields['User']>;
  export type UserInput = Pick<Types.UserInput, DefinedInputFields['UserInput']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  
  export type UserResolvers = Pick<Types.UserResolvers, DefinedFields['User'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  
  export interface Resolvers {
    User?: UserResolvers;
    Query?: QueryResolvers;
    Mutation?: MutationResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    User?: {
      '*'?: gm.Middleware[];
      email?: gm.Middleware[];
      username?: gm.Middleware[];
      first_name?: gm.Middleware[];
      last_name?: gm.Middleware[];
      major?: gm.Middleware[];
      last_login?: gm.Middleware[];
      date_joined?: gm.Middleware[];
      is_staff?: gm.Middleware[];
      is_active?: gm.Middleware[];
      email_class_update?: gm.Middleware[];
      email_grade_update?: gm.Middleware[];
      email_enrollment_opening?: gm.Middleware[];
      email_berkeleytime_update?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      user?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      updateUserInfo?: gm.Middleware[];
      deleteUser?: gm.Middleware[];
    };
  };
}