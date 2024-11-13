import { gql } from "@apollo/client";

export enum MetricName {
  Usefulness = "Usefulness",
  Difficulty = "Difficulty",
  Workload = "Workload",
  Attendance = "Attendance",
  Recording = "Recording"
}

export const GET_AGGREGATED_RATINGS = gql`
query GetAggregatedRatings(
  $subject: String!
  $courseNumber: String!
  $semester: Semester!
  $year: Int!
  $classNumber: String!
  $isAllTime: Boolean!
) {
  aggregatedRatings(
    subject: $subject
    courseNumber: $courseNumber
    semester: $semester
    year: $year
    classNumber: $classNumber
    isAllTime: $isAllTime
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
  ) {
    metrics {
      metricName
      weightedAverage
    }
  }
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
    }
  }
}
`;