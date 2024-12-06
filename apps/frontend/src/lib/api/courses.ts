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
  aggregatedRatings?: {
    metrics: Array<{
      count: number;
      metricName: string;
    }>;
  };
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

export interface GetCoursesResponse {
  courses: ICourse[];
}

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
