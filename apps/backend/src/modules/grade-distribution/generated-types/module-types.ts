import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace GradeDistributionModule {
  interface DefinedFields {
    GradeDistribution: 'average' | 'distribution';
    Grade: 'letter' | 'percentage' | 'count';
    Query: 'grade';
  };
  
  export type GradeDistribution = Pick<Types.GradeDistribution, DefinedFields['GradeDistribution']>;
  export type Grade = Pick<Types.Grade, DefinedFields['Grade']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type CourseNumber = Types.CourseNumber;
  export type ClassNumber = Types.ClassNumber;
  export type Semester = Types.Semester;
  
  export type GradeDistributionResolvers = Pick<Types.GradeDistributionResolvers, DefinedFields['GradeDistribution'] | '__isTypeOf'>;
  export type GradeResolvers = Pick<Types.GradeResolvers, DefinedFields['Grade'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  
  export interface Resolvers {
    GradeDistribution?: GradeDistributionResolvers;
    Grade?: GradeResolvers;
    Query?: QueryResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    GradeDistribution?: {
      '*'?: gm.Middleware[];
      average?: gm.Middleware[];
      distribution?: gm.Middleware[];
    };
    Grade?: {
      '*'?: gm.Middleware[];
      letter?: gm.Middleware[];
      percentage?: gm.Middleware[];
      count?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      grade?: gm.Middleware[];
    };
  };
}