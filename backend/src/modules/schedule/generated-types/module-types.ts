import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace ScheduleModule {
  interface DefinedFields {
    TermOutput: 'year' | 'semester';
    Schedule: '_id' | 'name' | 'created_by' | 'term' | 'is_public' | 'courses' | 'custom_events' | 'created' | 'revised';
    SelectedCourse: 'class_ID' | 'primary_section_ID' | 'secondary_section_IDs';
    CustomEvent: 'start_time' | 'end_time' | 'title' | 'location' | 'description' | 'days_of_week';
    Query: 'schedulesByUser' | 'scheduleByID';
    Mutation: 'removeScheduleByID' | 'createNewSchedule' | 'editExistingSchedule' | 'setSelectedClasses';
  };
  
  interface DefinedInputFields {
    CustomEventInput: 'start_time' | 'end_time' | 'title' | 'location' | 'description' | 'days_of_week';
    SelectedCourseInput: 'class_ID' | 'primary_section_ID' | 'secondary_section_IDs';
    ScheduleInput: 'name' | 'courses' | 'is_public' | 'term' | 'custom_events';
  };
  
  export type TermOutput = Pick<Types.TermOutput, DefinedFields['TermOutput']>;
  export type CustomEventInput = Pick<Types.CustomEventInput, DefinedInputFields['CustomEventInput']>;
  export type SelectedCourseInput = Pick<Types.SelectedCourseInput, DefinedInputFields['SelectedCourseInput']>;
  export type ScheduleInput = Pick<Types.ScheduleInput, DefinedInputFields['ScheduleInput']>;
  export type TermInput = Types.TermInput;
  export type Schedule = Pick<Types.Schedule, DefinedFields['Schedule']>;
  export type SelectedCourse = Pick<Types.SelectedCourse, DefinedFields['SelectedCourse']>;
  export type CustomEvent = Pick<Types.CustomEvent, DefinedFields['CustomEvent']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  
  export type TermOutputResolvers = Pick<Types.TermOutputResolvers, DefinedFields['TermOutput'] | '__isTypeOf'>;
  export type ScheduleResolvers = Pick<Types.ScheduleResolvers, DefinedFields['Schedule'] | '__isTypeOf'>;
  export type SelectedCourseResolvers = Pick<Types.SelectedCourseResolvers, DefinedFields['SelectedCourse'] | '__isTypeOf'>;
  export type CustomEventResolvers = Pick<Types.CustomEventResolvers, DefinedFields['CustomEvent'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  
  export interface Resolvers {
    TermOutput?: TermOutputResolvers;
    Schedule?: ScheduleResolvers;
    SelectedCourse?: SelectedCourseResolvers;
    CustomEvent?: CustomEventResolvers;
    Query?: QueryResolvers;
    Mutation?: MutationResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    TermOutput?: {
      '*'?: gm.Middleware[];
      year?: gm.Middleware[];
      semester?: gm.Middleware[];
    };
    Schedule?: {
      '*'?: gm.Middleware[];
      _id?: gm.Middleware[];
      name?: gm.Middleware[];
      created_by?: gm.Middleware[];
      term?: gm.Middleware[];
      is_public?: gm.Middleware[];
      courses?: gm.Middleware[];
      custom_events?: gm.Middleware[];
      created?: gm.Middleware[];
      revised?: gm.Middleware[];
    };
    SelectedCourse?: {
      '*'?: gm.Middleware[];
      class_ID?: gm.Middleware[];
      primary_section_ID?: gm.Middleware[];
      secondary_section_IDs?: gm.Middleware[];
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
      schedulesByUser?: gm.Middleware[];
      scheduleByID?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      removeScheduleByID?: gm.Middleware[];
      createNewSchedule?: gm.Middleware[];
      editExistingSchedule?: gm.Middleware[];
      setSelectedClasses?: gm.Middleware[];
    };
  };
}