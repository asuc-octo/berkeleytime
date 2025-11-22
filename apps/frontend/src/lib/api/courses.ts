import { gql } from "@apollo/client";

import {
  ReadCourseQuery,
  ReadCourseWithInstructorQuery,
} from "../generated/graphql";

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
      courseId
      subject
      number
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
      requirements
      aggregatedRatings(metricNames: [Recording, Attendance]) {
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
      }
    }
  }
`;

export const READ_COURSE_GRADE_DIST = gql`
  query ReadCourseGradeDist($subject: String!, $number: CourseNumber!) {
    course(subject: $subject, number: $number) {
      courseId
      subject
      number
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
        anyPrintInScheduleOfClasses
        primarySection {
          enrollment {
            latest {
              enrolledCount
            }
          }
          startDate
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

export const GET_ALL_CLASSES_FOR_COURSE = gql`
  query GetAllClassesForCourse($subject: String!, $number: CourseNumber!) {
    course(subject: $subject, number: $number) {
      classes {
        semester
        year
        number
        anyPrintInScheduleOfClasses
        primarySection {
          startDate
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

export type ICourseWithInstructorClass = NonNullable<
  ReadCourseWithInstructorQuery["course"]
>["classes"][number];

export const GET_COURSE_NAMES = gql`
  query GetCourseNames {
    courses {
      courseId
      subject
      number
      title
    }
  }
`;

export const GET_COURSES = gql`
  query GetCourses {
    courses {
      courseId
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
