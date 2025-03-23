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
