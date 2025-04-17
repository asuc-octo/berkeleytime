import { gql } from "@apollo/client";

import { GradeDistribution, IClass, InstructionMethod } from ".";
import { IAggregatedRatings } from "./ratings";
import { Semester } from "./terms";

export enum AcademicCareer {
  Undergraduate = "UGRD",
  Graduate = "GRAD",
  Extension = "UCBX",
}

export const academicCareers: Record<AcademicCareer, string> = {
  [AcademicCareer.Undergraduate]: "Undergraduate",
  [AcademicCareer.Graduate]: "Graduate",
  [AcademicCareer.Extension]: "Extension",
};

export interface ICourse {
  // Identifiers
  courseId: string;
  subject: string;
  number: string;

  // Relationships
  classes: IClass[];
  crossListing: ICourse[];
  requiredCourses: ICourse[];
  gradeDistribution: GradeDistribution;

  // Attributes
  requirements: string | null;
  description: string;
  fromDate: string;
  gradingBasis: string;
  finalExam: string | null;
  academicCareer: AcademicCareer;
  title: string;
  primaryInstructionMethod: InstructionMethod;
  toDate: string;
  typicallyOffered: Semester[] | null;
  aggregatedRatings?: IAggregatedRatings;
}

export interface ReadCourseResponse {
  course: ICourse;
}

export const READ_COURSE_TITLE = gql`
  query GetCourse($subject: String!, $number: CourseNumber!) {
    course(subject: $subject, number: $number) {
      courseId
      subject
      number
      title
    }
  }
`;

export const READ_COURSE = gql`
  query GetCourse($subject: String!, $number: CourseNumber!) {
    course(subject: $subject, number: $number) {
      courseId
      subject
      number
      title
      description
      academicCareer
      gradeDistribution {
        average
        distribution {
          letter
          count
        }
      }
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
      aggregatedRatings {
        metrics {
          metricName
          count
          weightedAverage
          categories {
            value
            count
          }
        }
      }
    }
  }
`;

export const READ_COURSE_GRADE_DIST = gql`
  query GetCourse($subject: String!, $number: CourseNumber!) {
    course(subject: $subject, number: $number) {
      gradeDistribution {
        average
        distribution {
          letter
          count
        }
      }
    }
  }
`;

export const READ_COURSE_WITH_INSTRUCTOR = gql`
  query GetCourse($subject: String!, $number: CourseNumber!) {
    course(subject: $subject, number: $number) {
      subject
      number
      title
      description
      academicCareer
      gradeDistribution {
        average
        distribution {
          letter
          count
        }
      }
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
        primarySection {
          enrollment {
            latest {
              enrolledCount
            }
          }
          meetings {
            instructors {
              familyName
              givenName
            }
          }
          number
        }
        gradeDistribution {
          average
        }
      }
    }
  }
`;

export interface GetCoursesResponse {
  courses: ICourse[];
}

export const GET_COURSE_NAMES = gql`
  query GetCourses {
    courses {
      subject
      number
      title
    }
  }
`;

export const GET_COURSES = gql`
  query GetCourses {
    courses {
      subject
      number
      title
      gradeDistribution {
        average
        distribution {
          letter
          count
        }
      }
      academicCareer
      finalExam
      gradingBasis
      typicallyOffered
      primaryInstructionMethod
    }
  }
`;
