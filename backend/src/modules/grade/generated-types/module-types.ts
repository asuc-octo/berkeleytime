import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace GradeModule {
  interface DefinedFields {
    Grade: 'average' | 'distribution';
    GradeDistributionItem: 'letter' | 'count';
    Query: 'grade';
  };
  
  export type Grade = Pick<Types.Grade, DefinedFields['Grade']>;
  export type GradeDistributionItem = Pick<Types.GradeDistributionItem, DefinedFields['GradeDistributionItem']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type Term = Types.Term;
  
  export type GradeResolvers = Pick<Types.GradeResolvers, DefinedFields['Grade'] | '__isTypeOf'>;
  export type GradeDistributionItemResolvers = Pick<Types.GradeDistributionItemResolvers, DefinedFields['GradeDistributionItem'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  
  export interface Resolvers {
    Grade?: GradeResolvers;
    GradeDistributionItem?: GradeDistributionItemResolvers;
    Query?: QueryResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Grade?: {
      '*'?: gm.Middleware[];
      average?: gm.Middleware[];
      distribution?: gm.Middleware[];
    };
    GradeDistributionItem?: {
      '*'?: gm.Middleware[];
      letter?: gm.Middleware[];
      count?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      grade?: gm.Middleware[];
    };
  };
}