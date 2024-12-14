import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace TermModule {
  interface DefinedFields {
    Session: 'temporalPosition' | 'name' | 'startDate' | 'endDate';
    Term: 'semester' | 'year' | 'temporalPosition' | 'startDate' | 'endDate' | 'sessions';
    Query: 'terms' | 'term';
  };
  
  interface DefinedEnumValues {
    Semester: 'Summer' | 'Fall' | 'Spring' | 'Winter';
    TemporalPosition: 'Past' | 'Current' | 'Future';
  };
  
  export type Semester = DefinedEnumValues['Semester'];
  export type TemporalPosition = DefinedEnumValues['TemporalPosition'];
  export type Session = Pick<Types.Session, DefinedFields['Session']>;
  export type Term = Pick<Types.Term, DefinedFields['Term']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  
  export type SessionResolvers = Pick<Types.SessionResolvers, DefinedFields['Session'] | '__isTypeOf'>;
  export type TermResolvers = Pick<Types.TermResolvers, DefinedFields['Term'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  
  export interface Resolvers {
    Session?: SessionResolvers;
    Term?: TermResolvers;
    Query?: QueryResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Session?: {
      '*'?: gm.Middleware[];
      temporalPosition?: gm.Middleware[];
      name?: gm.Middleware[];
      startDate?: gm.Middleware[];
      endDate?: gm.Middleware[];
    };
    Term?: {
      '*'?: gm.Middleware[];
      semester?: gm.Middleware[];
      year?: gm.Middleware[];
      temporalPosition?: gm.Middleware[];
      startDate?: gm.Middleware[];
      endDate?: gm.Middleware[];
      sessions?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      terms?: gm.Middleware[];
      term?: gm.Middleware[];
    };
  };
}