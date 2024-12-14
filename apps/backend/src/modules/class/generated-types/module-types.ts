import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace ClassModule {
  interface DefinedFields {
    Query: 'class' | 'section';
    Class: 'subject' | 'courseNumber' | 'number' | 'year' | 'semester' | 'session' | 'course' | 'primarySection' | 'sections' | 'term' | 'gradeDistribution' | 'gradingBasis' | 'finalExam' | 'description' | 'title' | 'unitsMax' | 'unitsMin';
    Section: 'subject' | 'courseNumber' | 'classNumber' | 'number' | 'year' | 'semester' | 'ccn' | 'class' | 'course' | 'term' | 'session' | 'primary' | 'enrollmentHistory' | 'component' | 'meetings' | 'exams' | 'startDate' | 'endDate' | 'online' | 'open' | 'reservations' | 'enrollCount' | 'waitlistCount' | 'enrollMax' | 'waitlistMax';
    Reservation: 'enrollCount' | 'enrollMax' | 'group';
    Meeting: 'days' | 'startTime' | 'endTime' | 'startDate' | 'endDate' | 'location' | 'instructors';
    Exam: 'date' | 'startTime' | 'endTime' | 'location' | 'final';
    Instructor: 'familyName' | 'givenName';
    EnrollmentDay: 'enrollCount' | 'enrollMax' | 'waitlistCount' | 'waitlistMax';
  };
  
  interface DefinedEnumValues {
    ClassFinalExam: 'Y' | 'N' | 'A' | 'C' | 'L';
    ClassGradingBasis: 'ESU' | 'SUS' | 'OPT' | 'PNP' | 'BMT' | 'GRD' | 'IOP';
    Component: 'WOR' | 'WBD' | 'CLN' | 'PRA' | 'GRP' | 'DIS' | 'VOL' | 'TUT' | 'FLD' | 'LEC' | 'SUP' | 'LAB' | 'SES' | 'STD' | 'SLF' | 'COL' | 'WBL' | 'IND' | 'INT' | 'REA' | 'REC' | 'SEM' | 'DEM';
  };
  
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type Class = Pick<Types.Class, DefinedFields['Class']>;
  export type Semester = Types.Semester;
  export type CourseNumber = Types.CourseNumber;
  export type Section = Pick<Types.Section, DefinedFields['Section']>;
  export type Course = Types.Course;
  export type Term = Types.Term;
  export type GradeDistribution = Types.GradeDistribution;
  export type ClassGradingBasis = DefinedEnumValues['ClassGradingBasis'];
  export type ClassFinalExam = DefinedEnumValues['ClassFinalExam'];
  export type EnrollmentDay = Pick<Types.EnrollmentDay, DefinedFields['EnrollmentDay']>;
  export type Component = DefinedEnumValues['Component'];
  export type Meeting = Pick<Types.Meeting, DefinedFields['Meeting']>;
  export type Exam = Pick<Types.Exam, DefinedFields['Exam']>;
  export type Reservation = Pick<Types.Reservation, DefinedFields['Reservation']>;
  export type Instructor = Pick<Types.Instructor, DefinedFields['Instructor']>;
  
  export type Scalars = Pick<Types.Scalars, 'ClassNumber' | 'SectionNumber' | 'SectionIdentifier'>;
  export type ClassNumberScalarConfig = Types.ClassNumberScalarConfig;
  export type SectionNumberScalarConfig = Types.SectionNumberScalarConfig;
  export type SectionIdentifierScalarConfig = Types.SectionIdentifierScalarConfig;
  
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type ClassResolvers = Pick<Types.ClassResolvers, DefinedFields['Class'] | '__isTypeOf'>;
  export type SectionResolvers = Pick<Types.SectionResolvers, DefinedFields['Section'] | '__isTypeOf'>;
  export type ReservationResolvers = Pick<Types.ReservationResolvers, DefinedFields['Reservation'] | '__isTypeOf'>;
  export type MeetingResolvers = Pick<Types.MeetingResolvers, DefinedFields['Meeting'] | '__isTypeOf'>;
  export type ExamResolvers = Pick<Types.ExamResolvers, DefinedFields['Exam'] | '__isTypeOf'>;
  export type InstructorResolvers = Pick<Types.InstructorResolvers, DefinedFields['Instructor'] | '__isTypeOf'>;
  export type EnrollmentDayResolvers = Pick<Types.EnrollmentDayResolvers, DefinedFields['EnrollmentDay'] | '__isTypeOf'>;
  
  export interface Resolvers {
    Query?: QueryResolvers;
    Class?: ClassResolvers;
    Section?: SectionResolvers;
    Reservation?: ReservationResolvers;
    Meeting?: MeetingResolvers;
    Exam?: ExamResolvers;
    Instructor?: InstructorResolvers;
    EnrollmentDay?: EnrollmentDayResolvers;
    ClassNumber?: Types.Resolvers['ClassNumber'];
    SectionNumber?: Types.Resolvers['SectionNumber'];
    SectionIdentifier?: Types.Resolvers['SectionIdentifier'];
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      class?: gm.Middleware[];
      section?: gm.Middleware[];
    };
    Class?: {
      '*'?: gm.Middleware[];
      subject?: gm.Middleware[];
      courseNumber?: gm.Middleware[];
      number?: gm.Middleware[];
      year?: gm.Middleware[];
      semester?: gm.Middleware[];
      session?: gm.Middleware[];
      course?: gm.Middleware[];
      primarySection?: gm.Middleware[];
      sections?: gm.Middleware[];
      term?: gm.Middleware[];
      gradeDistribution?: gm.Middleware[];
      gradingBasis?: gm.Middleware[];
      finalExam?: gm.Middleware[];
      description?: gm.Middleware[];
      title?: gm.Middleware[];
      unitsMax?: gm.Middleware[];
      unitsMin?: gm.Middleware[];
    };
    Section?: {
      '*'?: gm.Middleware[];
      subject?: gm.Middleware[];
      courseNumber?: gm.Middleware[];
      classNumber?: gm.Middleware[];
      number?: gm.Middleware[];
      year?: gm.Middleware[];
      semester?: gm.Middleware[];
      ccn?: gm.Middleware[];
      class?: gm.Middleware[];
      course?: gm.Middleware[];
      term?: gm.Middleware[];
      session?: gm.Middleware[];
      primary?: gm.Middleware[];
      enrollmentHistory?: gm.Middleware[];
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
  };
}