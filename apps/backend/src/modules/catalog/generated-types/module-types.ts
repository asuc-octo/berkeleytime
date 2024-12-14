import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace CatalogModule {
  interface DefinedFields {
    Query: 'catalog';
  };
  
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type Class = Types.Class;
  export type Semester = Types.Semester;
  
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
      catalog?: gm.Middleware[];
    };
  };
}