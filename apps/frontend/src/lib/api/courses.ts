import { gql } from "@apollo/client";

import { IClass } from ".";
import {
  ReadCourseQuery,
  ReadCourseWithInstructorQuery,
  Semester,
} from "../generated/graphql";
import { IAggregatedRatings } from "./ratings";

export type ICourse = NonNullable<ReadCourseQuery["course"]>;

export const READ_COURSE_TITLE = gql`
  query ReadCourseTitle($subject: String!, $number: CourseNumber!) {
    course(subject: $subject, number: $number) {
      courseId
      subject
      number
      title
    }
  }
`;

export const READ_COURSE_UNITS = gql`
  query ReadCourseUnits($subject: String!, $number: CourseNumber!) {
    course(subject: $subject, number: $number) {
      classes {
        unitsMax
        semester
        year
      }
    }
  }
`;

export const READ_COURSE = gql`
  query ReadCourse($subject: String!, $number: CourseNumber!) {
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

export const READ_COURSE_FOR_CLASS = gql`
  query ReadCourseForClass($subject: String!, $number: CourseNumber!) {
    course(subject: $subject, number: $number) {
      title
      description
      aggregatedRatings {
        metrics {
          categories {
            count
            value
          }
          count
          metricName
          weightedAverage
        }
      }
      gradeDistribution {
        average
        pnpPercentage
        distribution {
          letter
          count
        }
      }
      academicCareer
      requirements
      requiredCourses {
        subject
        number
      }
      classes {
        semester
        year
        number
        anyPrintInScheduleOfClasses
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

export const READ_COURSE_GRADE_DIST = gql`
  query ReadCourseGradeDist($subject: String!, $number: CourseNumber!) {
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
  query ReadCourseWithInstructor($subject: String!, $number: CourseNumber!) {
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
        sessionId
        subject
        courseNumber
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

export type ICourseWithInstructorClass = NonNullable<
  ReadCourseWithInstructorQuery["course"]
>["classes"][number];

export const GET_COURSE_NAMES = gql`
  query GetCourseNames {
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
