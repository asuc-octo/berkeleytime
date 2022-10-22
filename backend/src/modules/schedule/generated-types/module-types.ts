import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace ScheduleModule {
  interface DefinedFields {
    Schedule: 'created_by' | 'date_created' | 'last_updated' | 'term' | 'public' | 'class_IDs' | 'section_IDs' | 'custom_events';
    CustomEvent: 'start_time' | 'end_time' | 'title' | 'location' | 'description' | 'days_of_week';
    Query: 'schedules';
  };
  
  export type Schedule = Pick<Types.Schedule, DefinedFields['Schedule']>;
  export type User = Types.User;
  export type CustomEvent = Pick<Types.CustomEvent, DefinedFields['CustomEvent']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  
  export type ScheduleResolvers = Pick<Types.ScheduleResolvers, DefinedFields['Schedule'] | '__isTypeOf'>;
  export type CustomEventResolvers = Pick<Types.CustomEventResolvers, DefinedFields['CustomEvent'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  
  export interface Resolvers {
    Schedule?: ScheduleResolvers;
    CustomEvent?: CustomEventResolvers;
    Query?: QueryResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Schedule?: {
      '*'?: gm.Middleware[];
      created_by?: gm.Middleware[];
      date_created?: gm.Middleware[];
      last_updated?: gm.Middleware[];
      term?: gm.Middleware[];
      public?: gm.Middleware[];
      class_IDs?: gm.Middleware[];
      section_IDs?: gm.Middleware[];
      custom_events?: gm.Middleware[];
    };
    CustomEvent?: {
      '*'?: gm.Middleware[];
      start_time?: gm.Middleware[];
      end_time?: gm.Middleware[];
      title?: gm.Middleware[];
      location?: gm.Middleware[];
      description?: gm.Middleware[];
      days_of_week?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      schedules?: gm.Middleware[];
    };
  };
}