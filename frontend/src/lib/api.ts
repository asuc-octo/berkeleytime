import { gql } from "@apollo/client";

export enum Semester {
  Fall = "Fall",
  Spring = "Spring",
  Summer = "Summer",
}

export interface IInstructor {
  familyName: string;
  givenName: string;
}

export interface ISection {
  ccn: string;
  class: IClass;
  course: ICourse;
  enrollCount: number;
  enrollMax: number;
  component: string;
  number: string;
  primary: boolean;
  waitlistCount: number;
  waitlistMax: number;
  online: boolean;
  open: boolean;
  meetings: IMeeting[];
  reservations: IReservation[];
  startDate: string;
  endDate: string;
}

export interface IReservation {
  enrollCount: number;
  enrollMax: number;
  group: string;
}

export interface IMeeting {
  days: boolean[];
  endTime: string;
  location: string;
  startTime: string;
  instructors: IInstructor[];
}

export interface IClass {
  course: ICourse;
  primarySection: ISection;
  sections: ISection[];
  session: string;
  gradingBasis: string;
  finalExam: string;
  description: string | null;
  year: number;
  semester: Semester;
  title: string | null;
  unitsMax: number;
  unitsMin: number;
  number: string;
}

export interface ICourse {
  classes: IClass[];
  crossListing: ICourse[];
  sections: ISection[];
  requiredCourses: ICourse[];
  requirements: string | null;
  description: string;
  fromDate: string;
  gradeAverage: number | null;
  gradingBasis: string;
  finalExam: string;
  academicCareer: string;
  title: string;
  subject: string;
  number: string;
  toDate: string;
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
        unitsMax
        unitsMin
      }
      academicCareer
      description
      gradeAverage
      gradingBasis
      subject
      requirements
      requiredCourses {
        subject
        number
      }
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
      unitsMax
      unitsMin
      number
      course {
        title
        description
        gradeAverage
        gradingBasis
        subject
        academicCareer
        requirements
        requiredCourses {
          subject
          number
        }
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
        reservations {
          enrollCount
          enrollMax
          group
        }
        ccn
        enrollCount
        enrollMax
        meetings {
          days
          location
          endTime
          startTime
          instructors {
            familyName
            givenName
          }
        }
        component
        primary
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
        enrollCount
        enrollMax
        meetings {
          days
          endTime
          startTime
          location
          instructors {
            familyName
            givenName
          }
        }
        primary
        component
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
      gradeAverage
      academicCareer
      classes {
        number
        title
        unitsMax
        gradingBasis
        finalExam
        session
        unitsMin
        primarySection {
          component
          online
          open
          enrollCount
          enrollMax
          waitlistCount
          waitlistMax
        }
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
