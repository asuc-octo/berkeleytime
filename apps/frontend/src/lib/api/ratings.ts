import { gql } from "@apollo/client";

import { Semester } from "./terms";

export interface IMetric {
  categories: {
    count: number;
    value: number;
  }[];
  count: number;
  metricName: string;
  weightedAverage: number;
}

export interface IAggregatedRatings {
  metrics: IMetric[];
}

export interface UserRatingMetric {
  metricName: string;
  value: number;
}

export interface UserRatingClass {
  subject: string;
  courseNumber: string;
  semester: Semester;
  year: number;
  classNumber: string;
  metrics: UserRatingMetric[];
  lastUpdated: string;
}

export interface UserRatingsResponse {
  userRatings: {
    classes: UserRatingClass[];
  };
}

export const GET_AGGREGATED_RATINGS = gql`
  query GetAggregatedRatings(
    $subject: String!
    $courseNumber: String!
    $semester: Semester!
    $year: Int!
    $classNumber: String!
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

export interface SemestersWithRatingsResponse {
  semestersWithRatings: {
    semester: Semester;
    year: number;
    maxMetricCount: number;
  }[];
}

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
