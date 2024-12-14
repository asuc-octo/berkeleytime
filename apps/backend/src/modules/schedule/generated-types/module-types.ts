import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace ScheduleModule {
  interface DefinedFields {
    SelectedClass: 'class' | 'selectedSections';
    Event: 'startTime' | 'endTime' | 'days' | 'location' | 'title' | 'description';
    Schedule: '_id' | 'name' | 'createdBy' | 'year' | 'semester' | 'term' | 'public' | 'classes' | 'events';
    Query: 'schedules' | 'schedule';
    Mutation: 'deleteSchedule' | 'createSchedule' | 'updateSchedule';
  };
  
  interface DefinedInputFields {
    EventInput: 'startTime' | 'endTime' | 'days' | 'location' | 'title' | 'description';
    SelectedClassInput: 'subject' | 'courseNumber' | 'number' | 'sections';
    UpdateScheduleInput: 'name' | 'events' | 'classes' | 'public';
    CreateScheduleInput: 'name' | 'year' | 'semester' | 'events' | 'classes' | 'public';
  };
  
  export type SelectedClass = Pick<Types.SelectedClass, DefinedFields['SelectedClass']>;
  export type Class = Types.Class;
  export type SectionIdentifier = Types.SectionIdentifier;
  export type Event = Pick<Types.Event, DefinedFields['Event']>;
  export type Schedule = Pick<Types.Schedule, DefinedFields['Schedule']>;
  export type Semester = Types.Semester;
  export type Term = Types.Term;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type EventInput = Pick<Types.EventInput, DefinedInputFields['EventInput']>;
  export type SelectedClassInput = Pick<Types.SelectedClassInput, DefinedInputFields['SelectedClassInput']>;
  export type CourseNumber = Types.CourseNumber;
  export type ClassNumber = Types.ClassNumber;
  export type UpdateScheduleInput = Pick<Types.UpdateScheduleInput, DefinedInputFields['UpdateScheduleInput']>;
  export type CreateScheduleInput = Pick<Types.CreateScheduleInput, DefinedInputFields['CreateScheduleInput']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  
  export type SelectedClassResolvers = Pick<Types.SelectedClassResolvers, DefinedFields['SelectedClass'] | '__isTypeOf'>;
  export type EventResolvers = Pick<Types.EventResolvers, DefinedFields['Event'] | '__isTypeOf'>;
  export type ScheduleResolvers = Pick<Types.ScheduleResolvers, DefinedFields['Schedule'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  
  export interface Resolvers {
    SelectedClass?: SelectedClassResolvers;
    Event?: EventResolvers;
    Schedule?: ScheduleResolvers;
    Query?: QueryResolvers;
    Mutation?: MutationResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    SelectedClass?: {
      '*'?: gm.Middleware[];
      class?: gm.Middleware[];
      selectedSections?: gm.Middleware[];
    };
    Event?: {
      '*'?: gm.Middleware[];
      startTime?: gm.Middleware[];
      endTime?: gm.Middleware[];
      days?: gm.Middleware[];
      location?: gm.Middleware[];
      title?: gm.Middleware[];
      description?: gm.Middleware[];
    };
    Schedule?: {
      '*'?: gm.Middleware[];
      _id?: gm.Middleware[];
      name?: gm.Middleware[];
      createdBy?: gm.Middleware[];
      year?: gm.Middleware[];
      semester?: gm.Middleware[];
      term?: gm.Middleware[];
      public?: gm.Middleware[];
      classes?: gm.Middleware[];
      events?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      schedules?: gm.Middleware[];
      schedule?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      deleteSchedule?: gm.Middleware[];
      createSchedule?: gm.Middleware[];
      updateSchedule?: gm.Middleware[];
    };
  };
}