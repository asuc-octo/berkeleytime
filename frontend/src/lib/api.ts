import { gql } from "@apollo/client";

export enum Semester {
  Fall = "Fall",
  Spring = "Spring",
  Summer = "Summer",
}

export interface ICatalogClass {
  title: string;
  unitsMax: number;
  unitsMin: number;
  enrollCount: number;
  enrollMax: number;
  waitlistCount: number;
  waitlistMax: number;
  number: string;
}

export interface IInstructor {
  familyName: string;
  givenName: string;
}

export interface ISection {
  ccn: string;
  dateEnd: string;
  dateStart: string;
  days: boolean[];
  enrollCount: number;
  enrollMax: number;
  instructors: IInstructor[];
  kind: string;
  location: string;
  notes: string;
  number: string;
  primary: boolean;
  timeEnd: string;
  timeStart: string;
  waitlistCount: number;
  waitlistMax: number;
}

export interface IClass extends ICatalogClass {
  course: ICourse;
  primarySection: ISection;
  sections: ISection[];
  description: string;
  notes: string;
}

export interface ICatalogCourse {
  title: string;
  subject: string;
  number: string;
  gradeAverage?: number;
  classes: ICatalogClass[];
}

export interface ICourse extends Omit<ICatalogCourse, "classes" | "number"> {
  subjectName: string;
  prereqs?: string;
  gradingBasis: string;
  description: string;
}

export interface IAccount {
  email: string;
}

export const GET_CLASS = gql`
  query GetClass(
    $term: TermInput!
    $subject: String!
    $courseNumber: String!
    $classNumber: String!
  ) {
    class(
      term: $term
      subject: $subject
      courseNumber: $courseNumber
      classNumber: $classNumber
    ) {
      title
      description
      enrollCount
      enrollMax
      unitsMax
      unitsMin
      waitlistCount
      waitlistMax
      number
      course {
        title
        description
        gradeAverage
        gradingBasis
        subjectName
        prereqs
      }
      primarySection {
        ccn
        dateEnd
        dateStart
        days
        enrollCount
        enrollMax
        instructors {
          familyName
          givenName
        }
        kind
        location
        notes
        primary
        timeEnd
        timeStart
        waitlistCount
        waitlistMax
        number
      }
      sections {
        ccn
        dateEnd
        dateStart
        days
        enrollCount
        enrollMax
        instructors {
          familyName
          givenName
        }
        kind
        location
        notes
        primary
        timeEnd
        timeStart
        waitlistCount
        waitlistMax
        number
      }
    }
  }
`;

export const GET_COURSES = gql`
  query GetCourses($term: TermInput!) {
    catalog(term: $term) {
      subject
      number
      title
      description
      gradeAverage
      classes {
        number
        title
        description
        enrollCount
        enrollMax
        unitsMax
        unitsMin
      }
    }
  }
`;

export const GET_ACCOUNT = gql`
  query GetAccount {
    user {
      email
    }
  }
`;
