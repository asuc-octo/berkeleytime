import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace CatalogModule {
  interface DefinedFields {
    Query: 'catalog' | 'course' | 'class' | 'section';
    Course: 'allClasses' | 'classes' | 'crossListing' | 'description' | 'fromDate' | 'gradeAverage' | 'gradingBasis' | 'level' | 'number' | 'prereqs' | 'subject' | 'subjectName' | 'title' | 'toDate' | 'raw' | 'lastUpdated';
    Class: 'course' | 'description' | 'enrollCount' | 'enrollMax' | 'number' | 'primarySection' | 'sections' | 'semester' | 'session' | 'status' | 'title' | 'unitsMax' | 'unitsMin' | 'waitlistCount' | 'waitlistMax' | 'year' | 'raw' | 'lastUpdated';
    Section: 'ccn' | 'class' | 'course' | 'dateEnd' | 'dateStart' | 'days' | 'enrollCount' | 'enrollMax' | 'instructors' | 'kind' | 'location' | 'notes' | 'number' | 'primary' | 'timeEnd' | 'timeStart' | 'waitlistCount' | 'waitlistMax' | 'raw' | 'lastUpdated';
    CatalogItem: 'subject' | 'number' | 'title' | 'description' | 'classes' | 'gradeAverage' | 'lastUpdated';
    CatalogClass: 'number' | 'title' | 'description' | 'enrollCount' | 'enrollMax' | 'unitsMax' | 'unitsMin' | 'lastUpdated';
  };
  
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type CatalogItem = Pick<Types.CatalogItem, DefinedFields['CatalogItem']>;
  export type Term = Types.Term;
  export type Course = Pick<Types.Course, DefinedFields['Course']>;
  export type Class = Pick<Types.Class, DefinedFields['Class']>;
  export type Section = Pick<Types.Section, DefinedFields['Section']>;
  export type JSONObject = Types.JsonObject;
  export type ISODate = Types.IsoDate;
  export type Semester = Types.Semester;
  export type CatalogClass = Pick<Types.CatalogClass, DefinedFields['CatalogClass']>;
  
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type CourseResolvers = Pick<Types.CourseResolvers, DefinedFields['Course'] | '__isTypeOf'>;
  export type ClassResolvers = Pick<Types.ClassResolvers, DefinedFields['Class'] | '__isTypeOf'>;
  export type SectionResolvers = Pick<Types.SectionResolvers, DefinedFields['Section'] | '__isTypeOf'>;
  export type CatalogItemResolvers = Pick<Types.CatalogItemResolvers, DefinedFields['CatalogItem'] | '__isTypeOf'>;
  export type CatalogClassResolvers = Pick<Types.CatalogClassResolvers, DefinedFields['CatalogClass'] | '__isTypeOf'>;
  
  export interface Resolvers {
    Query?: QueryResolvers;
    Course?: CourseResolvers;
    Class?: ClassResolvers;
    Section?: SectionResolvers;
    CatalogItem?: CatalogItemResolvers;
    CatalogClass?: CatalogClassResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      catalog?: gm.Middleware[];
      course?: gm.Middleware[];
      class?: gm.Middleware[];
      section?: gm.Middleware[];
    };
    Course?: {
      '*'?: gm.Middleware[];
      allClasses?: gm.Middleware[];
      classes?: gm.Middleware[];
      crossListing?: gm.Middleware[];
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
      description?: gm.Middleware[];
      enrollCount?: gm.Middleware[];
      enrollMax?: gm.Middleware[];
      number?: gm.Middleware[];
      primarySection?: gm.Middleware[];
      sections?: gm.Middleware[];
      semester?: gm.Middleware[];
      session?: gm.Middleware[];
      status?: gm.Middleware[];
      title?: gm.Middleware[];
      unitsMax?: gm.Middleware[];
      unitsMin?: gm.Middleware[];
      waitlistCount?: gm.Middleware[];
      waitlistMax?: gm.Middleware[];
      year?: gm.Middleware[];
      raw?: gm.Middleware[];
      lastUpdated?: gm.Middleware[];
    };
    Section?: {
      '*'?: gm.Middleware[];
      ccn?: gm.Middleware[];
      class?: gm.Middleware[];
      course?: gm.Middleware[];
      dateEnd?: gm.Middleware[];
      dateStart?: gm.Middleware[];
      days?: gm.Middleware[];
      enrollCount?: gm.Middleware[];
      enrollMax?: gm.Middleware[];
      instructors?: gm.Middleware[];
      kind?: gm.Middleware[];
      location?: gm.Middleware[];
      notes?: gm.Middleware[];
      number?: gm.Middleware[];
      primary?: gm.Middleware[];
      timeEnd?: gm.Middleware[];
      timeStart?: gm.Middleware[];
      waitlistCount?: gm.Middleware[];
      waitlistMax?: gm.Middleware[];
      raw?: gm.Middleware[];
      lastUpdated?: gm.Middleware[];
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
      enrollCount?: gm.Middleware[];
      enrollMax?: gm.Middleware[];
      unitsMax?: gm.Middleware[];
      unitsMin?: gm.Middleware[];
      lastUpdated?: gm.Middleware[];
    };
  };
}