import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace CourseModule {
  interface DefinedFields {
    Query: 'course' | 'courses';
    Course: 'subject' | 'number' | 'classes' | 'crossListing' | 'requiredCourses' | 'requirements' | 'description' | 'fromDate' | 'gradeDistribution' | 'gradingBasis' | 'finalExam' | 'academicCareer' | 'title' | 'primaryInstructionMethod' | 'toDate' | 'typicallyOffered';
  };
  
  interface DefinedEnumValues {
    CourseGradingBasis: 'completedNotation' | 'passFail' | 'letter' | 'satisfactory' | 'graded';
    CourseFinalExam: 'D' | 'N' | 'A' | 'C' | 'Y';
    AcademicCareer: 'UGRD' | 'GRAD' | 'UCBX';
    InstructionMethod: 'UNK' | 'DEM' | 'CON' | 'WOR' | 'WBD' | 'CLC' | 'GRP' | 'DIS' | 'TUT' | 'FLD' | 'LEC' | 'LAB' | 'SES' | 'STD' | 'SLF' | 'COL' | 'WBL' | 'IND' | 'INT' | 'REA' | 'REC' | 'SEM';
  };
  
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type Course = Pick<Types.Course, DefinedFields['Course']>;
  export type Class = Types.Class;
  export type GradeDistribution = Types.GradeDistribution;
  export type CourseGradingBasis = DefinedEnumValues['CourseGradingBasis'];
  export type CourseFinalExam = DefinedEnumValues['CourseFinalExam'];
  export type AcademicCareer = DefinedEnumValues['AcademicCareer'];
  export type InstructionMethod = DefinedEnumValues['InstructionMethod'];
  
  export type Scalars = Pick<Types.Scalars, 'CourseNumber'>;
  export type CourseNumberScalarConfig = Types.CourseNumberScalarConfig;
  
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type CourseResolvers = Pick<Types.CourseResolvers, DefinedFields['Course'] | '__isTypeOf'>;
  
  export interface Resolvers {
    Query?: QueryResolvers;
    Course?: CourseResolvers;
    CourseNumber?: Types.Resolvers['CourseNumber'];
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      course?: gm.Middleware[];
      courses?: gm.Middleware[];
    };
    Course?: {
      '*'?: gm.Middleware[];
      subject?: gm.Middleware[];
      number?: gm.Middleware[];
      classes?: gm.Middleware[];
      crossListing?: gm.Middleware[];
      requiredCourses?: gm.Middleware[];
      requirements?: gm.Middleware[];
      description?: gm.Middleware[];
      fromDate?: gm.Middleware[];
      gradeDistribution?: gm.Middleware[];
      gradingBasis?: gm.Middleware[];
      finalExam?: gm.Middleware[];
      academicCareer?: gm.Middleware[];
      title?: gm.Middleware[];
      primaryInstructionMethod?: gm.Middleware[];
      toDate?: gm.Middleware[];
      typicallyOffered?: gm.Middleware[];
    };
  };
}