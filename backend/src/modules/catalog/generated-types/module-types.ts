import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace CatalogModule {
  interface DefinedFields {
    Query: 'course' | 'class' | 'section' | 'catalog' | 'courseList';
    Course: 'classes' | 'crossListing' | 'sections' | 'requiredCourses' | 'requirements' | 'description' | 'fromDate' | 'gradeAverage' | 'gradingBasis' | 'finalExam' | 'academicCareer' | 'number' | 'subject' | 'title' | 'toDate' | 'raw' | 'lastUpdated';
    Class: 'course' | 'primarySection' | 'sections' | 'session' | 'gradingBasis' | 'finalExam' | 'description' | 'title' | 'number' | 'semester' | 'year' | 'unitsMax' | 'unitsMin' | 'raw' | 'lastUpdated';
    Section: 'class' | 'course' | 'enrollmentHistory' | 'ccn' | 'number' | 'primary' | 'component' | 'meetings' | 'exams' | 'startDate' | 'endDate' | 'online' | 'open' | 'reservations' | 'enrollCount' | 'waitlistCount' | 'enrollMax' | 'waitlistMax' | 'raw' | 'lastUpdated';
    Reservation: 'enrollCount' | 'enrollMax' | 'group';
    Meeting: 'days' | 'startTime' | 'endTime' | 'startDate' | 'endDate' | 'location' | 'instructors';
    Exam: 'date' | 'startTime' | 'endTime' | 'location' | 'final';
    Instructor: 'familyName' | 'givenName';
    EnrollmentDay: 'enrollCount' | 'enrollMax' | 'waitlistCount' | 'waitlistMax';
    CourseListItem: 'subject' | 'number';
  };
  
  interface DefinedEnumValues {
    AcademicCareer: 'UGRD' | 'GRAD' | 'UCBX';
    CourseFinalExam: 'D' | 'N' | 'A' | 'C' | 'Y';
    CourseGradingBasis: 'completedNotation' | 'passFail' | 'letter' | 'satisfactory' | 'graded';
    ClassFinalExam: 'Y' | 'N' | 'A' | 'C';
    ClassGradingBasis: 'ESU' | 'SUS' | 'OPT' | 'PNP' | 'BMT' | 'GRD' | 'IOP';
    Session: 'R' | 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
    Component: 'WOR' | 'WBD' | 'CLN' | 'PRA' | 'GRP' | 'DIS' | 'VOL' | 'TUT' | 'FLD' | 'LEC' | 'SUP' | 'LAB' | 'SES' | 'STD' | 'SLF' | 'COL' | 'WBL' | 'IND' | 'INT' | 'REA' | 'REC' | 'SEM';
  };
  
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type Course = Pick<Types.Course, DefinedFields['Course']>;
  export type TermInput = Types.TermInput;
  export type Class = Pick<Types.Class, DefinedFields['Class']>;
  export type Section = Pick<Types.Section, DefinedFields['Section']>;
  export type CourseListItem = Pick<Types.CourseListItem, DefinedFields['CourseListItem']>;
  export type CourseGradingBasis = DefinedEnumValues['CourseGradingBasis'];
  export type CourseFinalExam = DefinedEnumValues['CourseFinalExam'];
  export type AcademicCareer = DefinedEnumValues['AcademicCareer'];
  export type JSONObject = Types.JsonObject;
  export type ISODate = Types.IsoDate;
  export type Session = DefinedEnumValues['Session'];
  export type ClassGradingBasis = DefinedEnumValues['ClassGradingBasis'];
  export type ClassFinalExam = DefinedEnumValues['ClassFinalExam'];
  export type Semester = Types.Semester;
  export type EnrollmentDay = Pick<Types.EnrollmentDay, DefinedFields['EnrollmentDay']>;
  export type Component = DefinedEnumValues['Component'];
  export type Meeting = Pick<Types.Meeting, DefinedFields['Meeting']>;
  export type Exam = Pick<Types.Exam, DefinedFields['Exam']>;
  export type Reservation = Pick<Types.Reservation, DefinedFields['Reservation']>;
  export type Instructor = Pick<Types.Instructor, DefinedFields['Instructor']>;
  
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type CourseResolvers = Pick<Types.CourseResolvers, DefinedFields['Course'] | '__isTypeOf'>;
  export type ClassResolvers = Pick<Types.ClassResolvers, DefinedFields['Class'] | '__isTypeOf'>;
  export type SectionResolvers = Pick<Types.SectionResolvers, DefinedFields['Section'] | '__isTypeOf'>;
  export type ReservationResolvers = Pick<Types.ReservationResolvers, DefinedFields['Reservation'] | '__isTypeOf'>;
  export type MeetingResolvers = Pick<Types.MeetingResolvers, DefinedFields['Meeting'] | '__isTypeOf'>;
  export type ExamResolvers = Pick<Types.ExamResolvers, DefinedFields['Exam'] | '__isTypeOf'>;
  export type InstructorResolvers = Pick<Types.InstructorResolvers, DefinedFields['Instructor'] | '__isTypeOf'>;
  export type EnrollmentDayResolvers = Pick<Types.EnrollmentDayResolvers, DefinedFields['EnrollmentDay'] | '__isTypeOf'>;
  export type CourseListItemResolvers = Pick<Types.CourseListItemResolvers, DefinedFields['CourseListItem'] | '__isTypeOf'>;
  
  export interface Resolvers {
    Query?: QueryResolvers;
    Course?: CourseResolvers;
    Class?: ClassResolvers;
    Section?: SectionResolvers;
    Reservation?: ReservationResolvers;
    Meeting?: MeetingResolvers;
    Exam?: ExamResolvers;
    Instructor?: InstructorResolvers;
    EnrollmentDay?: EnrollmentDayResolvers;
    CourseListItem?: CourseListItemResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      course?: gm.Middleware[];
      class?: gm.Middleware[];
      section?: gm.Middleware[];
      catalog?: gm.Middleware[];
      courseList?: gm.Middleware[];
    };
    Course?: {
      '*'?: gm.Middleware[];
      classes?: gm.Middleware[];
      crossListing?: gm.Middleware[];
      sections?: gm.Middleware[];
      requiredCourses?: gm.Middleware[];
      requirements?: gm.Middleware[];
      description?: gm.Middleware[];
      fromDate?: gm.Middleware[];
      gradeAverage?: gm.Middleware[];
      gradingBasis?: gm.Middleware[];
      finalExam?: gm.Middleware[];
      academicCareer?: gm.Middleware[];
      number?: gm.Middleware[];
      subject?: gm.Middleware[];
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
      session?: gm.Middleware[];
      gradingBasis?: gm.Middleware[];
      finalExam?: gm.Middleware[];
      description?: gm.Middleware[];
      title?: gm.Middleware[];
      number?: gm.Middleware[];
      semester?: gm.Middleware[];
      year?: gm.Middleware[];
      unitsMax?: gm.Middleware[];
      unitsMin?: gm.Middleware[];
      raw?: gm.Middleware[];
      lastUpdated?: gm.Middleware[];
    };
    Section?: {
      '*'?: gm.Middleware[];
      class?: gm.Middleware[];
      course?: gm.Middleware[];
      enrollmentHistory?: gm.Middleware[];
      ccn?: gm.Middleware[];
      number?: gm.Middleware[];
      primary?: gm.Middleware[];
      component?: gm.Middleware[];
      meetings?: gm.Middleware[];
      exams?: gm.Middleware[];
      startDate?: gm.Middleware[];
      endDate?: gm.Middleware[];
      online?: gm.Middleware[];
      open?: gm.Middleware[];
      reservations?: gm.Middleware[];
      enrollCount?: gm.Middleware[];
      waitlistCount?: gm.Middleware[];
      enrollMax?: gm.Middleware[];
      waitlistMax?: gm.Middleware[];
      raw?: gm.Middleware[];
      lastUpdated?: gm.Middleware[];
    };
    Reservation?: {
      '*'?: gm.Middleware[];
      enrollCount?: gm.Middleware[];
      enrollMax?: gm.Middleware[];
      group?: gm.Middleware[];
    };
    Meeting?: {
      '*'?: gm.Middleware[];
      days?: gm.Middleware[];
      startTime?: gm.Middleware[];
      endTime?: gm.Middleware[];
      startDate?: gm.Middleware[];
      endDate?: gm.Middleware[];
      location?: gm.Middleware[];
      instructors?: gm.Middleware[];
    };
    Exam?: {
      '*'?: gm.Middleware[];
      date?: gm.Middleware[];
      startTime?: gm.Middleware[];
      endTime?: gm.Middleware[];
      location?: gm.Middleware[];
      final?: gm.Middleware[];
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
    CourseListItem?: {
      '*'?: gm.Middleware[];
      subject?: gm.Middleware[];
      number?: gm.Middleware[];
    };
  };
}