import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace ScheduleModule {
  interface DefinedFields {
    TermOutput: 'year' | 'semester';
    Schedule: '_id' | 'name' | 'created_by' | 'term' | 'is_public' | 'classes' | 'custom_events' | 'created' | 'revised';
    SelectedCourse: 'class_ID' | 'primary_section_ID' | 'secondary_section_IDs';
    Course: 'classes' | 'crossListing' | 'sections' | 'description' | 'fromDate' | 'gradeAverage' | 'gradingBasis' | 'level' | 'number' | 'prereqs' | 'subject' | 'subjectName' | 'title' | 'toDate' | 'raw' | 'lastUpdated';
    Class: 'course' | 'primarySection' | 'sections' | 'description' | 'enrollCount' | 'enrollMax' | 'number' | 'semester' | 'session' | 'status' | 'title' | 'unitsMax' | 'unitsMin' | 'waitlistCount' | 'waitlistMax' | 'year' | 'raw' | 'lastUpdated';
    Section: 'class' | 'course' | 'enrollmentHistory' | 'ccn' | 'dateEnd' | 'dateStart' | 'days' | 'enrollCount' | 'enrollMax' | 'instructors' | 'kind' | 'location' | 'notes' | 'number' | 'primary' | 'timeEnd' | 'timeStart' | 'waitlistCount' | 'waitlistMax' | 'raw' | 'lastUpdated';
    Instructor: 'familyName' | 'givenName';
    EnrollmentDay: 'enrollCount' | 'enrollMax' | 'waitlistCount' | 'waitlistMax';
    CustomEvent: 'start_time' | 'end_time' | 'title' | 'location' | 'description' | 'days_of_week';
    Query: 'schedulesByUser' | 'scheduleByID';
    Mutation: 'removeScheduleByID' | 'createNewSchedule' | 'editExistingSchedule' | 'setSelectedClasses';
  };
  
  interface DefinedInputFields {
    CustomEventInput: 'start_time' | 'end_time' | 'title' | 'location' | 'description' | 'days_of_week';
    SelectedCourseInput: 'class_ID' | 'primary_section_ID' | 'secondary_section_IDs';
    ScheduleInput: 'name' | 'created_by' | 'courses' | 'is_public' | 'term' | 'custom_events';
  };
  
  export type TermOutput = Pick<Types.TermOutput, DefinedFields['TermOutput']>;
  export type CustomEventInput = Pick<Types.CustomEventInput, DefinedInputFields['CustomEventInput']>;
  export type SelectedCourseInput = Pick<Types.SelectedCourseInput, DefinedInputFields['SelectedCourseInput']>;
  export type ScheduleInput = Pick<Types.ScheduleInput, DefinedInputFields['ScheduleInput']>;
  export type TermInput = Types.TermInput;
  export type Schedule = Pick<Types.Schedule, DefinedFields['Schedule']>;
  export type Class = Pick<Types.Class, DefinedFields['Class']>;
  export type CustomEvent = Pick<Types.CustomEvent, DefinedFields['CustomEvent']>;
  export type SelectedCourse = Pick<Types.SelectedCourse, DefinedFields['SelectedCourse']>;
  export type Course = Pick<Types.Course, DefinedFields['Course']>;
  export type Section = Pick<Types.Section, DefinedFields['Section']>;
  export type JSONObject = Types.JsonObject;
  export type ISODate = Types.IsoDate;
  export type Semester = Types.Semester;
  export type EnrollmentDay = Pick<Types.EnrollmentDay, DefinedFields['EnrollmentDay']>;
  export type Instructor = Pick<Types.Instructor, DefinedFields['Instructor']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  
  export type TermOutputResolvers = Pick<Types.TermOutputResolvers, DefinedFields['TermOutput'] | '__isTypeOf'>;
  export type ScheduleResolvers = Pick<Types.ScheduleResolvers, DefinedFields['Schedule'] | '__isTypeOf'>;
  export type SelectedCourseResolvers = Pick<Types.SelectedCourseResolvers, DefinedFields['SelectedCourse'] | '__isTypeOf'>;
  export type CourseResolvers = Pick<Types.CourseResolvers, DefinedFields['Course'] | '__isTypeOf'>;
  export type ClassResolvers = Pick<Types.ClassResolvers, DefinedFields['Class'] | '__isTypeOf'>;
  export type SectionResolvers = Pick<Types.SectionResolvers, DefinedFields['Section'] | '__isTypeOf'>;
  export type InstructorResolvers = Pick<Types.InstructorResolvers, DefinedFields['Instructor'] | '__isTypeOf'>;
  export type EnrollmentDayResolvers = Pick<Types.EnrollmentDayResolvers, DefinedFields['EnrollmentDay'] | '__isTypeOf'>;
  export type CustomEventResolvers = Pick<Types.CustomEventResolvers, DefinedFields['CustomEvent'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  
  export interface Resolvers {
    TermOutput?: TermOutputResolvers;
    Schedule?: ScheduleResolvers;
    SelectedCourse?: SelectedCourseResolvers;
    Course?: CourseResolvers;
    Class?: ClassResolvers;
    Section?: SectionResolvers;
    Instructor?: InstructorResolvers;
    EnrollmentDay?: EnrollmentDayResolvers;
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
      classes?: gm.Middleware[];
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
      enrollCount?: gm.Middleware[];
      enrollMax?: gm.Middleware[];
      number?: gm.Middleware[];
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
      class?: gm.Middleware[];
      course?: gm.Middleware[];
      enrollmentHistory?: gm.Middleware[];
      ccn?: gm.Middleware[];
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
    Instructor?: {
      '*'?: gm.Middleware[];
      familyName?: gm.Middleware[];
      givenName?: gm.Middleware[];
    };
    EnrollmentDay?: {
      '*'?: gm.Middleware[];
      enrollCount?: gm.Middleware[];
      enrollMax?: gm.Middleware[];
      waitlistCount?: gm.Middleware[];
      waitlistMax?: gm.Middleware[];
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