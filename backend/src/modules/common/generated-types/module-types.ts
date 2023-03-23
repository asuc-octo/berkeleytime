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
  
  export type Scalars = Pick<Types.Scalars, 'JSON' | 'JSONObject' | 'ISODate'>;
  export type JsonScalarConfig = Types.JsonScalarConfig;
  export type JsonObjectScalarConfig = Types.JsonObjectScalarConfig;
  export type IsoDateScalarConfig = Types.IsoDateScalarConfig;
  
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  
  export interface Resolvers {
    Query?: QueryResolvers;
    JSON?: Types.Resolvers['JSON'];
    JSONObject?: Types.Resolvers['JSONObject'];
    ISODate?: Types.Resolvers['ISODate'];
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