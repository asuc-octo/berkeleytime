import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace UserModule {
  interface DefinedFields {
    User: 'id' | 'password' | 'last_login' | 'is_superuser' | 'username' | 'first_name' | 'last_name' | 'email' | 'is_staff' | 'is_active' | 'date_joined' | 'major' | 'email_class_update' | 'email_grade_update' | 'email_enrollment_opening' | 'email_berkeleytime_update';
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
      id?: gm.Middleware[];
      password?: gm.Middleware[];
      last_login?: gm.Middleware[];
      is_superuser?: gm.Middleware[];
      username?: gm.Middleware[];
      first_name?: gm.Middleware[];
      last_name?: gm.Middleware[];
      email?: gm.Middleware[];
      is_staff?: gm.Middleware[];
      is_active?: gm.Middleware[];
      date_joined?: gm.Middleware[];
      major?: gm.Middleware[];
      email_class_update?: gm.Middleware[];
      email_grade_update?: gm.Middleware[];
      email_enrollment_opening?: gm.Middleware[];
      email_berkeleytime_update?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      User?: gm.Middleware[];
    };
  };
}