import { gql } from "graphql-tag";

const typedef = gql`
  enum MetricName {
    "Numerical metrics"
    Usefulness
    Difficulty
    Workload

    "Boolean metrics"
    Attendance
    Recording
  }

  """
  Ratings by class
  """
  type AggregatedRatings {
    "Class identifier"
    subject: String!
    courseNumber: String!
    classNumber: String
    semester: Semester
    year: Int

    metrics: [Metric!]!
  }
  type Metric {
    metricName: MetricName!
    count: Int!
    weightedAverage: Float!
    categories: [Category!]!
  }
  type Category {
    value: Int!
    count: Int!
  }

  """
  Ratings by user
  """
  type UserRatings {
    createdBy: String!
    count: Int!
    classes: [UserClass!]!
  }
  type UserClass {
    "Class Identifiers"
    subject: String!
    courseNumber: String!
    semester: Semester!
    year: Int!
    classNumber: String!

    metrics: [UserMetric!]!
  }
  type UserMetric {
    metricName: MetricName!
    value: Int!
  }
  type SemesterAvailable {
    year: Int!
    semester: Semester!
  }

  """
  Get data
  """
  type Query {
    aggregatedRatings(
      subject: String!
      courseNumber: String!
      semester: Semester!
      year: Int!
      classNumber: String!
    ): AggregatedRatings!

    userRatings: UserRatings! @auth

    userClassRatings(
      subject: String!
      courseNumber: String!
      semester: Semester!
      year: Int!
      classNumber: String!
    ): UserClass! @auth
  }

  """
  Modify data
  """
  type Mutation {
    createRating(
      "Class Identifiers"
      subject: String!
      courseNumber: String!
      semester: Semester!
      year: Int!
      classNumber: String!

      metricName: MetricName!
      value: Int!
    ): AggregatedRatings! @auth

    deleteRating(
      "Class Identifiers"
      subject: String!
      courseNumber: String!
      semester: Semester!
      year: Int!
      classNumber: String!
      metricName: MetricName!
    ): Boolean! @auth
  }
`;

export default typedef;
