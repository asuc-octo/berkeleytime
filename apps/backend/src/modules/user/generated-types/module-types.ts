import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace UserModule {
  interface DefinedFields {
    User: 'email' | 'student' | 'bookmarkedCourses' | 'bookmarkedClasses';
    Query: 'user';
    Mutation: 'updateUser';
  };
  
  interface DefinedInputFields {
    BookmarkedCourseInput: 'subject' | 'number';
    BookmarkedClassInput: 'year' | 'semester' | 'subject' | 'courseNumber' | 'number';
    UpdateUserInput: 'bookmarkedClasses' | 'bookmarkedCourses';
  };
  
  export type User = Pick<Types.User, DefinedFields['User']>;
  export type Course = Types.Course;
  export type Class = Types.Class;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type BookmarkedCourseInput = Pick<Types.BookmarkedCourseInput, DefinedInputFields['BookmarkedCourseInput']>;
  export type CourseNumber = Types.CourseNumber;
  export type BookmarkedClassInput = Pick<Types.BookmarkedClassInput, DefinedInputFields['BookmarkedClassInput']>;
  export type Semester = Types.Semester;
  export type ClassNumber = Types.ClassNumber;
  export type UpdateUserInput = Pick<Types.UpdateUserInput, DefinedInputFields['UpdateUserInput']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  
  export type UserResolvers = Pick<Types.UserResolvers, DefinedFields['User'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  
  export interface Resolvers {
    User?: UserResolvers;
    Query?: QueryResolvers;
    Mutation?: MutationResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    User?: {
      '*'?: gm.Middleware[];
      email?: gm.Middleware[];
      student?: gm.Middleware[];
      bookmarkedCourses?: gm.Middleware[];
      bookmarkedClasses?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      user?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      updateUser?: gm.Middleware[];
    };
  };
}