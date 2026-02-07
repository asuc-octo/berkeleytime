import { gql } from "@apollo/client";

import {
  GetCourseCommentsQuery,
  GetCourseQuery,
  GetCourseWithInstructorQuery,
} from "../generated/graphql";

export type ICourse = NonNullable<GetCourseQuery["course"]>;

export type ICourseComment = NonNullable<
  GetCourseCommentsQuery["courseComments"]
>[number];

export const GET_COURSE_COMMENTS = gql`
  query GetCourseComments($courseId: CourseIdentifier!) {
    courseComments(courseId: $courseId) {
      _id
      courseId
      author {
        _id
        name
      }
      content
      createdAt
    }
  }
`;

export const GET_COURSE_TITLE = gql`
  query GetCourseTitle($subject: String!, $number: CourseNumber!) {
    course(subject: $subject, number: $number) {
      courseId
      subject
      number
      title
    }
  }
`;

export const GET_COURSE_UNITS = gql`
  query GetCourseUnits($subject: String!, $number: CourseNumber!) {
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

export const GET_COURSE = gql`
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

export const GET_CLASS_OVERVIEW = gql`
  query GetClassOverview($subject: String!, $number: CourseNumber!) {
    course(subject: $subject, number: $number) {
      title
      description
      requirements
      aggregatedRatings(metricNames: [Attendance, Recording]) {
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
      gradeDistribution {
        average
        pnpPercentage
      }
    }
  }
`;

export const GET_COURSE_OVERVIEW_BY_ID = gql`
  query GetCourseOverviewById($courseId: CourseIdentifier!) {
    courseById(courseId: $courseId) {
      title
      description
      requirements
      ratingsCount
      aggregatedRatings(metricNames: [Attendance, Recording]) {
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
      gradeDistribution {
        average
        pnpPercentage
      }
    }
  }
`;

export const GET_COURSE_GRADE_DIST = gql`
  query GetCourseGradeDist($subject: String!, $number: CourseNumber!) {
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

export const GET_COURSE_WITH_INSTRUCTOR = gql`
  query GetCourseWithInstructor($subject: String!, $number: CourseNumber!) {
    course(subject: $subject, number: $number) {
      classes {
        year
        semester
        number
        sessionId
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
  GetCourseWithInstructorQuery["course"]
>["classes"][number];

export const GET_COURSE_NAMES = gql`
  query GetCourseNames {
    courses {
      courseId
      subject
      departmentNicknames
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
