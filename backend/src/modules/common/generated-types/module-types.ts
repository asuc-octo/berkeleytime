import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace CommonModule {
  interface DefinedFields {
    Query: 'ping';
  };
  
  interface DefinedEnumValues {
    Semester: 'Fall' | 'Spring' | 'Summer';
  };
  
  interface DefinedInputFields {
    Term: 'year' | 'semester';
  };
  
  export type Term = Pick<Types.Term, DefinedInputFields['Term']>;
  export type Semester = DefinedEnumValues['Semester'];
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  
  export interface Resolvers {
    Query?: QueryResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      ping?: gm.Middleware[];
    };
  };
}