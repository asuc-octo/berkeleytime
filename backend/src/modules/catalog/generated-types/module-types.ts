import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace CatalogModule {
  interface DefinedFields {
    Query: 'catalog' | 'course' | 'class' | 'section';
    Course: 'classes' | 'crossListing' | 'department' | 'description' | 'gradeAverage' | 'gradingBasis' | 'level' | 'number' | 'prereqs' | 'subject' | 'subjectName' | 'title' | 'raw';
    Class: 'course' | 'description' | 'enrollCount' | 'enrollMax' | 'number' | 'sections' | 'session' | 'status' | 'title' | 'unitsMax' | 'unitsMin' | 'waitlistCount' | 'waitlistMax' | 'lastUpdated' | 'raw';
    Section: 'class' | 'course' | 'days' | 'enrollCount' | 'enrollMax' | 'instructors' | 'location' | 'notes' | 'number' | 'primary' | 'timeStart' | 'timeEnd' | 'type' | 'waitlistCount' | 'waitlistMax' | 'raw';
    CatalogItem: 'subject' | 'number' | 'title' | 'description' | 'classes' | 'gradeAverage' | 'lastUpdated';
    CatalogClass: 'number' | 'title' | 'description' | 'enrollCount' | 'enrollMax' | 'lastUpdated' | 'unitsMin' | 'unitsMax';
  };
  
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type CatalogItem = Pick<Types.CatalogItem, DefinedFields['CatalogItem']>;
  export type Term = Types.Term;
  export type Course = Pick<Types.Course, DefinedFields['Course']>;
  export type Class = Pick<Types.Class, DefinedFields['Class']>;
  export type Section = Pick<Types.Section, DefinedFields['Section']>;
  export type JSONObject = Types.JsonObject;
  export type CatalogClass = Pick<Types.CatalogClass, DefinedFields['CatalogClass']>;
  export type ISODate = Types.IsoDate;
  
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
      classes?: gm.Middleware[];
      crossListing?: gm.Middleware[];
      department?: gm.Middleware[];
      description?: gm.Middleware[];
      gradeAverage?: gm.Middleware[];
      gradingBasis?: gm.Middleware[];
      level?: gm.Middleware[];
      number?: gm.Middleware[];
      prereqs?: gm.Middleware[];
      subject?: gm.Middleware[];
      subjectName?: gm.Middleware[];
      title?: gm.Middleware[];
      raw?: gm.Middleware[];
    };
    Class?: {
      '*'?: gm.Middleware[];
      course?: gm.Middleware[];
      description?: gm.Middleware[];
      enrollCount?: gm.Middleware[];
      enrollMax?: gm.Middleware[];
      number?: gm.Middleware[];
      sections?: gm.Middleware[];
      session?: gm.Middleware[];
      status?: gm.Middleware[];
      title?: gm.Middleware[];
      unitsMax?: gm.Middleware[];
      unitsMin?: gm.Middleware[];
      waitlistCount?: gm.Middleware[];
      waitlistMax?: gm.Middleware[];
      lastUpdated?: gm.Middleware[];
      raw?: gm.Middleware[];
    };
    Section?: {
      '*'?: gm.Middleware[];
      class?: gm.Middleware[];
      course?: gm.Middleware[];
      days?: gm.Middleware[];
      enrollCount?: gm.Middleware[];
      enrollMax?: gm.Middleware[];
      instructors?: gm.Middleware[];
      location?: gm.Middleware[];
      notes?: gm.Middleware[];
      number?: gm.Middleware[];
      primary?: gm.Middleware[];
      timeStart?: gm.Middleware[];
      timeEnd?: gm.Middleware[];
      type?: gm.Middleware[];
      waitlistCount?: gm.Middleware[];
      waitlistMax?: gm.Middleware[];
      raw?: gm.Middleware[];
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
      lastUpdated?: gm.Middleware[];
      unitsMin?: gm.Middleware[];
      unitsMax?: gm.Middleware[];
    };
  };
}