import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace ClassesModule {
  interface DefinedFields {
    Enrollment: 'classId' | 'enrollmentInfo';
    EnrollmentInfo: 'enrolledCount' | 'date';
    Query: 'Enrollment' | 'EnrollmentById';
  };
  
  export type Enrollment = Pick<Types.Enrollment, DefinedFields['Enrollment']>;
  export type EnrollmentInfo = Pick<Types.EnrollmentInfo, DefinedFields['EnrollmentInfo']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  
  export type EnrollmentResolvers = Pick<Types.EnrollmentResolvers, DefinedFields['Enrollment'] | '__isTypeOf'>;
  export type EnrollmentInfoResolvers = Pick<Types.EnrollmentInfoResolvers, DefinedFields['EnrollmentInfo'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  
  export interface Resolvers {
    Enrollment?: EnrollmentResolvers;
    EnrollmentInfo?: EnrollmentInfoResolvers;
    Query?: QueryResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Enrollment?: {
      '*'?: gm.Middleware[];
      classId?: gm.Middleware[];
      enrollmentInfo?: gm.Middleware[];
    };
    EnrollmentInfo?: {
      '*'?: gm.Middleware[];
      enrolledCount?: gm.Middleware[];
      date?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      Enrollment?: gm.Middleware[];
      EnrollmentById?: gm.Middleware[];
    };
  };
}