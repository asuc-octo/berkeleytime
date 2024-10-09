import { gql } from "@apollo/client";

import { AcademicCareer, IClass, ISection, InstructionMethod } from "../api";
import { Semester } from "./term";

export interface ICourse {
  classes: IClass[];
  crossListing: ICourse[];
  sections: ISection[];
  requiredCourses: ICourse[];
  requirements: string | null;
  primaryInstructionMethod: InstructionMethod;
  description: string;
  fromDate: string;
  gradeAverage: number | null;
  gradingBasis: string;
  finalExam: string | null;
  academicCareer: AcademicCareer;
  title: string;
  subject: string;
  number: string;
  toDate: string;
  typicallyOffered: Semester[] | null;
}

export interface GetCourseResponse {
  course: ICourse;
}

export const GET_COURSE = gql`
  query GetCourse($subject: String!, $courseNumber: String!) {
    course(subject: $subject, courseNumber: $courseNumber) {
      title
      description
      subject
      number
      academicCareer
      gradeAverage
      gradingBasis
      finalExam
      requirements
      requiredCourses {
        subject
        number
      }
      classes {
        year
        semester
        number
      }
    }
  }
`;

export interface GetCoursesResponse {
  courseList: ICourse[];
}

export const GET_COURSES = gql`
  query GetCourses {
    courseList {
      subject
      number
      title
      gradeAverage
      academicCareer
      finalExam
      gradingBasis
      typicallyOffered
      primaryInstructionMethod
    }
  }
`;

export interface GetClassesResponse {
  catalog: ICourse[];
}

export const GET_CLASSES = gql`
  query GetClasses($term: TermInput!) {
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
        unitsMin
        finalExam
        gradingBasis
        primarySection {
          component
          online
          open
          enrollCount
          enrollMax
          waitlistCount
          waitlistMax
          meetings {
            days
          }
        }
      }
    }
  }
`;
