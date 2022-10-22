import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace ScheduleModule {
  interface DefinedFields {
    Schedule: 'date_created' | 'last_updated' | 'term';
    Query: 'schedule';
  };
  
  export type Schedule = Pick<Types.Schedule, DefinedFields['Schedule']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  
  export type ScheduleResolvers = Pick<Types.ScheduleResolvers, DefinedFields['Schedule'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  
  export interface Resolvers {
   Scheduler?: ScheduleResolvers;
    Query?: QueryResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Scheduler?: {
      '*'?: gm.Middleware[];
      date_created?: gm.Middleware[];
      last_updated?: gm.Middleware[];
      term?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      schedules?: gm.Middleware[];
    };
  };
}