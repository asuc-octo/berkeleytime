import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace EnrollmentModule {
  interface DefinedFields {
    Query: 'enrollment';
  };
  
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type Section = Types.Section;
  export type Semester = Types.Semester;
  export type CourseNumber = Types.CourseNumber;
  export type SectionNumber = Types.SectionNumber;
  
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
      enrollment?: gm.Middleware[];
    };
  };
}