import { gql } from "@apollo/client";

export enum Semester {
  Fall = "Fall",
  Spring = "Spring",
  Summer = "Summer",
}

export interface ICatalogClass {
  title: string | null;
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
  class: {
    number: string;
  };
  course: {
    subject: string;
    number: string;
  };
  days: boolean[] | null;
  enrollCount: number;
  enrollMax: number;
  instructors: IInstructor[] | null;
  kind: string;
  location: string | null;
  notes: string | null;
  number: string;
  primary: boolean;
  timeEnd: string | null;
  timeStart: string | null;
  waitlistCount: number;
  waitlistMax: number;
}

export interface IClass extends ICatalogClass {
  course: ICourse;
  primarySection: ISection;
  sections: ISection[];
  description: string | null;
  notes: string;
  year: number;
  semester: Semester;
  session: string;
}

export interface ICatalogCourse {
  title: string;
  subject: string;
  number: string;
  gradeAverage: number | null;
  classes: ICatalogClass[];
}

export interface ICourse extends Omit<ICatalogCourse, "classes"> {
  subjectName: string;
  prereqs: string | null;
  gradingBasis: string;
  description: string;
  classes: IClass[];
  sections: ISection[];
}

export interface IAccount {
  email: string;
}

export const GET_COURSE = gql`
  query GetCourse($subject: String!, $courseNumber: String!) {
    course(subject: $subject, courseNumber: $courseNumber) {
      title
      classes {
        year
        semester
        number
      }
      level
      description
      gradeAverage
      gradingBasis
      subjectName
      subject
      prereqs
      number
    }
  }
`;

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
        subject
        subjectName
        level
        prereqs
        number
        classes {
          year
          semester
          number
        }
      }
      primarySection {
        course {
          subject
          number
        }
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
        course {
          subject
          number
        }
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