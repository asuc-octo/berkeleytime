import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace GradeModule {
  interface DefinedFields {
    Grade: 'APlus' | 'A' | 'AMinus' | 'BPlus' | 'B' | 'BMinus' | 'CPlus' | 'C' | 'CMinus' | 'D' | 'F' | 'P' | 'NP';
    Query: 'grades';
  };
  
  export type Grade = Pick<Types.Grade, DefinedFields['Grade']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  
  export type GradeResolvers = Pick<Types.GradeResolvers, DefinedFields['Grade'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  
  export interface Resolvers {
    Grade?: GradeResolvers;
    Query?: QueryResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Grade?: {
      '*'?: gm.Middleware[];
      APlus?: gm.Middleware[];
      A?: gm.Middleware[];
      AMinus?: gm.Middleware[];
      BPlus?: gm.Middleware[];
      B?: gm.Middleware[];
      BMinus?: gm.Middleware[];
      CPlus?: gm.Middleware[];
      C?: gm.Middleware[];
      CMinus?: gm.Middleware[];
      D?: gm.Middleware[];
      F?: gm.Middleware[];
      P?: gm.Middleware[];
      NP?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      grades?: gm.Middleware[];
    };
  };
}