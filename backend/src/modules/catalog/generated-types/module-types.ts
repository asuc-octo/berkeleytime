import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace CatalogModule {
  interface DefinedFields {
    Query: 'course' | 'class' | 'section' | 'catalog' | 'courseList';
    Course: 'classes' | 'crossListing' | 'sections' | 'description' | 'fromDate' | 'gradeAverage' | 'gradingBasis' | 'level' | 'number' | 'prereqs' | 'subject' | 'subjectName' | 'title' | 'toDate' | 'raw' | 'lastUpdated';
    Class: 'course' | 'primarySection' | 'sections' | 'description' | 'enrollment' | 'number' | 'semester' | 'session' | 'status' | 'title' | 'unitsMax' | 'unitsMin' | 'year' | 'raw' | 'lastUpdated';
    Section: 'class' | 'course' | 'enrollmentHistory' | 'ccn' | 'dateEnd' | 'dateStart' | 'days' | 'currentEnrollment' | 'instructors' | 'kind' | 'location' | 'notes' | 'number' | 'primary' | 'timeEnd' | 'timeStart' | 'raw' | 'lastUpdated';
    Instructor: 'familyName' | 'givenName';
    EnrollmentData: 'enrollCount' | 'enrollMax' | 'waitlistCount' | 'waitlistMax';
    CatalogItem: 'subject' | 'number' | 'title' | 'description' | 'classes' | 'gradeAverage' | 'lastUpdated';
    CatalogClass: 'number' | 'title' | 'description' | 'enrollment' | 'unitsMax' | 'unitsMin' | 'lastUpdated';
    CourseListItem: 'subject' | 'number';
  };
  
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type Course = Pick<Types.Course, DefinedFields['Course']>;
  export type TermInput = Types.TermInput;
  export type Class = Pick<Types.Class, DefinedFields['Class']>;
  export type Section = Pick<Types.Section, DefinedFields['Section']>;
  export type CatalogItem = Pick<Types.CatalogItem, DefinedFields['CatalogItem']>;
  export type CourseListItem = Pick<Types.CourseListItem, DefinedFields['CourseListItem']>;
  export type JSONObject = Types.JsonObject;
  export type ISODate = Types.IsoDate;
  export type EnrollmentData = Pick<Types.EnrollmentData, DefinedFields['EnrollmentData']>;
  export type Semester = Types.Semester;
  export type Instructor = Pick<Types.Instructor, DefinedFields['Instructor']>;
  export type CatalogClass = Pick<Types.CatalogClass, DefinedFields['CatalogClass']>;
  
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type CourseResolvers = Pick<Types.CourseResolvers, DefinedFields['Course'] | '__isTypeOf'>;
  export type ClassResolvers = Pick<Types.ClassResolvers, DefinedFields['Class'] | '__isTypeOf'>;
  export type SectionResolvers = Pick<Types.SectionResolvers, DefinedFields['Section'] | '__isTypeOf'>;
  export type InstructorResolvers = Pick<Types.InstructorResolvers, DefinedFields['Instructor'] | '__isTypeOf'>;
  export type EnrollmentDataResolvers = Pick<Types.EnrollmentDataResolvers, DefinedFields['EnrollmentData'] | '__isTypeOf'>;
  export type CatalogItemResolvers = Pick<Types.CatalogItemResolvers, DefinedFields['CatalogItem'] | '__isTypeOf'>;
  export type CatalogClassResolvers = Pick<Types.CatalogClassResolvers, DefinedFields['CatalogClass'] | '__isTypeOf'>;
  export type CourseListItemResolvers = Pick<Types.CourseListItemResolvers, DefinedFields['CourseListItem'] | '__isTypeOf'>;
  
  export interface Resolvers {
    Query?: QueryResolvers;
    Course?: CourseResolvers;
    Class?: ClassResolvers;
    Section?: SectionResolvers;
    Instructor?: InstructorResolvers;
    EnrollmentData?: EnrollmentDataResolvers;
    CatalogItem?: CatalogItemResolvers;
    CatalogClass?: CatalogClassResolvers;
    CourseListItem?: CourseListItemResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      course?: gm.Middleware[];
      class?: gm.Middleware[];
      section?: gm.Middleware[];
      catalog?: gm.Middleware[];
      courseList?: gm.Middleware[];
    };
    Course?: {
      '*'?: gm.Middleware[];
      classes?: gm.Middleware[];
      crossListing?: gm.Middleware[];
      sections?: gm.Middleware[];
      description?: gm.Middleware[];
      fromDate?: gm.Middleware[];
      gradeAverage?: gm.Middleware[];
      gradingBasis?: gm.Middleware[];
      level?: gm.Middleware[];
      number?: gm.Middleware[];
      prereqs?: gm.Middleware[];
      subject?: gm.Middleware[];
      subjectName?: gm.Middleware[];
      title?: gm.Middleware[];
      toDate?: gm.Middleware[];
      raw?: gm.Middleware[];
      lastUpdated?: gm.Middleware[];
    };
    Class?: {
      '*'?: gm.Middleware[];
      course?: gm.Middleware[];
      primarySection?: gm.Middleware[];
      sections?: gm.Middleware[];
      description?: gm.Middleware[];
      enrollment?: gm.Middleware[];
      number?: gm.Middleware[];
      semester?: gm.Middleware[];
      session?: gm.Middleware[];
      status?: gm.Middleware[];
      title?: gm.Middleware[];
      unitsMax?: gm.Middleware[];
      unitsMin?: gm.Middleware[];
      year?: gm.Middleware[];
      raw?: gm.Middleware[];
      lastUpdated?: gm.Middleware[];
    };
    Section?: {
      '*'?: gm.Middleware[];
      class?: gm.Middleware[];
      course?: gm.Middleware[];
      enrollmentHistory?: gm.Middleware[];
      ccn?: gm.Middleware[];
      dateEnd?: gm.Middleware[];
      dateStart?: gm.Middleware[];
      days?: gm.Middleware[];
      currentEnrollment?: gm.Middleware[];
      instructors?: gm.Middleware[];
      kind?: gm.Middleware[];
      location?: gm.Middleware[];
      notes?: gm.Middleware[];
      number?: gm.Middleware[];
      primary?: gm.Middleware[];
      timeEnd?: gm.Middleware[];
      timeStart?: gm.Middleware[];
      raw?: gm.Middleware[];
      lastUpdated?: gm.Middleware[];
    };
    Instructor?: {
      '*'?: gm.Middleware[];
      familyName?: gm.Middleware[];
      givenName?: gm.Middleware[];
    };
    EnrollmentData?: {
      '*'?: gm.Middleware[];
      enrollCount?: gm.Middleware[];
      enrollMax?: gm.Middleware[];
      waitlistCount?: gm.Middleware[];
      waitlistMax?: gm.Middleware[];
    };
    CatalogItem?: {
      '*'?: gm.Middleware[];
      subject?: gm.Middleware[];
      number?: gm.Middleware[];
      title?: gm.Middleware[];
      description?: gm.Middleware[];
      classes?: gm.Middleware[];
      gradeAverage?: gm.Middleware[];
      lastUpdated?: gm.Middleware[];
    };
    CatalogClass?: {
      '*'?: gm.Middleware[];
      number?: gm.Middleware[];
      title?: gm.Middleware[];
      description?: gm.Middleware[];
      enrollment?: gm.Middleware[];
      unitsMax?: gm.Middleware[];
      unitsMin?: gm.Middleware[];
      lastUpdated?: gm.Middleware[];
    };
    CourseListItem?: {
      '*'?: gm.Middleware[];
      subject?: gm.Middleware[];
      number?: gm.Middleware[];
    };
  };
}