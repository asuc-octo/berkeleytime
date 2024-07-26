import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace TermModule {
  interface DefinedFields {
    Term: 'semester' | 'year' | 'active';
    Query: 'terms';
  };
  
  interface DefinedEnumValues {
    Semester: 'S' | 'F' | 'P' | 'W';
  };
  
  export type Semester = DefinedEnumValues['Semester'];
  export type Term = Pick<Types.Term, DefinedFields['Term']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  
  export type TermResolvers = Pick<Types.TermResolvers, DefinedFields['Term'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  
  export interface Resolvers {
    Term?: TermResolvers;
    Query?: QueryResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Term?: {
      '*'?: gm.Middleware[];
      semester?: gm.Middleware[];
      year?: gm.Middleware[];
      active?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      terms?: gm.Middleware[];
    };
  };
}