import { gql } from "@apollo/client";

import {
  GetAggregatedRatingsQuery,
  GetUserRatingsQuery,
} from "../generated/graphql";

export type IAggregatedRatings = GetAggregatedRatingsQuery["aggregatedRatings"];

export type IMetric = NonNullable<
  NonNullable<IAggregatedRatings>["metrics"]
>[number];

export type IUserRatingClass = NonNullable<
  NonNullable<GetUserRatingsQuery["userRatings"]>["classes"]
>[number];

export type IUserRatingMetric = NonNullable<
  NonNullable<IUserRatingClass>["metrics"]
>[number];

export const GET_AGGREGATED_RATINGS = gql`
  query GetAggregatedRatings(
    $subject: String!
    $courseNumber: String!
    $semester: Semester!
    $year: Int!
    $classNumber: String
  ) {
    aggregatedRatings(
      subject: $subject
      courseNumber: $courseNumber
      semester: $semester
      year: $year
      classNumber: $classNumber
    ) {
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
`;

export const GET_SEMESTERS_WITH_RATINGS = gql`
  query GetSemestersWithRatings($subject: String!, $courseNumber: String!) {
    semestersWithRatings(subject: $subject, courseNumber: $courseNumber) {
      semester
      year
      maxMetricCount
    }
  }
`;

export const CREATE_RATING = gql`
  mutation CreateRating(
    $subject: String!
    $courseNumber: String!
    $semester: Semester!
    $year: Int!
    $classNumber: String!
    $metricName: MetricName!
    $value: Int!
  ) {
    createRating(
      subject: $subject
      courseNumber: $courseNumber
      semester: $semester
      year: $year
      classNumber: $classNumber
      metricName: $metricName
      value: $value
    )
  }
`;

export const DELETE_RATING = gql`
  mutation DeleteRating(
    $subject: String!
    $courseNumber: String!
    $semester: Semester!
    $year: Int!
    $classNumber: String!
    $metricName: MetricName!
  ) {
    deleteRating(
      subject: $subject
      courseNumber: $courseNumber
      semester: $semester
      year: $year
      classNumber: $classNumber
      metricName: $metricName
    )
  }
`;

export const GET_USER_RATINGS = gql`
  query GetUserRatings {
    userRatings {
      classes {
        subject
        courseNumber
        semester
        year
        classNumber
        metrics {
          metricName
          value
        }
        lastUpdated
      }
    }
  }
`;

export const GET_COURSE_RATINGS = gql`
  query GetCourseRatings($subject: String!, $number: CourseNumber!) {
    course(subject: $subject, number: $number) {
      subject
      number
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

export const GET_ALL_RATINGS_DATA = gql`
  query GetAllRatingsData($subject: String!, $courseNumber: String!) {
    semestersWithRatings(subject: $subject, courseNumber: $courseNumber) {
      semester
      year
      maxMetricCount
    }
    userRatings {
      classes {
        subject
        courseNumber
        semester
        year
        classNumber
        metrics {
          metricName
          value
        }
        lastUpdated
      }
    }
  }
`;

export const GET_RATINGS_FOR_TAB = gql`
  query GetRatingsForTab(
    $subject: String!
    $courseNumber: String!
    $courseNumberTyped: CourseNumber!
  ) {
    course(subject: $subject, number: $courseNumberTyped) {
      subject
      number
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
    semestersWithRatings(subject: $subject, courseNumber: $courseNumber) {
      semester
      year
      maxMetricCount
    }
    userRatings {
      classes {
        subject
        courseNumber
        semester
        year
        classNumber
        metrics {
          metricName
          value
        }
        lastUpdated
      }
    }
  }
`;
