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
  number: string;
}

export interface IClass extends ICatalogClass {
  course: Omit<ICatalogCourse, "classes">;
}

export interface ICatalogCourse {
  title: string;
  subject: string;
  number: string;
  gradeAverage?: number;
  classes: ICatalogClass[];
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
