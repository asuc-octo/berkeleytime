import { gql } from "@apollo/client";

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
