import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace CatalogModule {
  interface DefinedFields {
    Course: 'id' | 'title' | 'gradeAverage' | 'letterAverage' | 'classes' | 'crossListing' | 'prereqs' | 'units' | 'displayName';
    Class: 'course' | 'displayName' | 'number' | 'subjectArea' | 'term' | 'title' | 'description' | 'instructors' | 'sections';
    Section: 'instructors' | 'class' | 'course' | 'number' | 'ccn' | 'type' | 'location' | 'instructionMode' | 'associatedSections' | 'times' | 'primary';
    SectionTimes: 'days' | 'start' | 'end';
    SubjectArea: 'code' | 'description';
    Instructor: 'name' | 'id';
    Query: 'catalog';
    CatalogItem: 'courseId' | 'displayName' | 'courseTitle' | 'classTitle' | 'letterAverage' | 'enrolled' | 'units';
  };
  
  export type Course = Pick<Types.Course, DefinedFields['Course']>;
  export type Class = Pick<Types.Class, DefinedFields['Class']>;
  export type SubjectArea = Pick<Types.SubjectArea, DefinedFields['SubjectArea']>;
  export type Instructor = Pick<Types.Instructor, DefinedFields['Instructor']>;
  export type Section = Pick<Types.Section, DefinedFields['Section']>;
  export type SectionTimes = Pick<Types.SectionTimes, DefinedFields['SectionTimes']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type CatalogItem = Pick<Types.CatalogItem, DefinedFields['CatalogItem']>;
  
  export type CourseResolvers = Pick<Types.CourseResolvers, DefinedFields['Course'] | '__isTypeOf'>;
  export type ClassResolvers = Pick<Types.ClassResolvers, DefinedFields['Class'] | '__isTypeOf'>;
  export type SectionResolvers = Pick<Types.SectionResolvers, DefinedFields['Section'] | '__isTypeOf'>;
  export type SectionTimesResolvers = Pick<Types.SectionTimesResolvers, DefinedFields['SectionTimes'] | '__isTypeOf'>;
  export type SubjectAreaResolvers = Pick<Types.SubjectAreaResolvers, DefinedFields['SubjectArea'] | '__isTypeOf'>;
  export type InstructorResolvers = Pick<Types.InstructorResolvers, DefinedFields['Instructor'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type CatalogItemResolvers = Pick<Types.CatalogItemResolvers, DefinedFields['CatalogItem'] | '__isTypeOf'>;
  
  export interface Resolvers {
    Course?: CourseResolvers;
    Class?: ClassResolvers;
    Section?: SectionResolvers;
    SectionTimes?: SectionTimesResolvers;
    SubjectArea?: SubjectAreaResolvers;
    Instructor?: InstructorResolvers;
    Query?: QueryResolvers;
    CatalogItem?: CatalogItemResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Course?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      title?: gm.Middleware[];
      gradeAverage?: gm.Middleware[];
      letterAverage?: gm.Middleware[];
      classes?: gm.Middleware[];
      crossListing?: gm.Middleware[];
      prereqs?: gm.Middleware[];
      units?: gm.Middleware[];
      displayName?: gm.Middleware[];
    };
    Class?: {
      '*'?: gm.Middleware[];
      course?: gm.Middleware[];
      displayName?: gm.Middleware[];
      number?: gm.Middleware[];
      subjectArea?: gm.Middleware[];
      term?: gm.Middleware[];
      title?: gm.Middleware[];
      description?: gm.Middleware[];
      instructors?: gm.Middleware[];
      sections?: gm.Middleware[];
    };
    Section?: {
      '*'?: gm.Middleware[];
      instructors?: gm.Middleware[];
      class?: gm.Middleware[];
      course?: gm.Middleware[];
      number?: gm.Middleware[];
      ccn?: gm.Middleware[];
      type?: gm.Middleware[];
      location?: gm.Middleware[];
      instructionMode?: gm.Middleware[];
      associatedSections?: gm.Middleware[];
      times?: gm.Middleware[];
      primary?: gm.Middleware[];
    };
    SectionTimes?: {
      '*'?: gm.Middleware[];
      days?: gm.Middleware[];
      start?: gm.Middleware[];
      end?: gm.Middleware[];
    };
    SubjectArea?: {
      '*'?: gm.Middleware[];
      code?: gm.Middleware[];
      description?: gm.Middleware[];
    };
    Instructor?: {
      '*'?: gm.Middleware[];
      name?: gm.Middleware[];
      id?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      catalog?: gm.Middleware[];
    };
    CatalogItem?: {
      '*'?: gm.Middleware[];
      courseId?: gm.Middleware[];
      displayName?: gm.Middleware[];
      courseTitle?: gm.Middleware[];
      classTitle?: gm.Middleware[];
      letterAverage?: gm.Middleware[];
      enrolled?: gm.Middleware[];
      units?: gm.Middleware[];
    };
  };
}