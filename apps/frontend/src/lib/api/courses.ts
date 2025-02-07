import { gql } from "@apollo/client";

import {
  AcademicCareer,
  GradeDistribution,
  IClass,
  InstructionMethod,
} from ".";
import { Semester } from "./terms";

export interface ICourse {
  // Identifiers
  subject: string;
  number: string;

  // Relationships
  classes: IClass[];
  crossListing: ICourse[];
  requiredCourses: ICourse[];
  gradeDistribution: GradeDistribution;

  // Attributes
  requirements: string | null;
  primaryInstructionMethod: InstructionMethod;
  description: string;
  fromDate: string;
  gradingBasis: string;
  finalExam: string | null;
  academicCareer: AcademicCareer;
  title: string;
  toDate: string;
  typicallyOffered: Semester[] | null;
}

export interface ReadCourseResponse {
  course: ICourse;
}

export const READ_COURSE = gql`
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
          meetings {
            instructors {
              familyName
              givenName
            }
          }
        }
      }
    }
  }
`;

export interface GetCoursesResponse {
  courses: ICourse[];
}

export const GET_COURSES = gql`
  query GetCourses {
    courses {
      subject
      number
      title
      # TODO: Grade distribution not yet supported by backend
      gradeDistribution {
        average
        # distribution {
        #   letter
        #   count
        # }
      }
      academicCareer
      finalExam
      gradingBasis
      typicallyOffered
      primaryInstructionMethod
    }
  }
`;
