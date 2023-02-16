import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace GradeModule {
  interface DefinedFields {
    Grade: 'course_id';
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
      course_id?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      grades?: gm.Middleware[];
    };
  };
}