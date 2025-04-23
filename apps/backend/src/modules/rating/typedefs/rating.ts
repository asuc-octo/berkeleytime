import { gql } from "graphql-tag";

const typedef = gql`
  enum MetricName {
    Usefulness
    Difficulty
    Workload
    Attendance
    Recording
    Recommended
  }

  """
  Ratings by class
  """
  type AggregatedRatings @cacheControl(maxAge: 1) {
    "Class identifier"
    year: Int
    semester: Semester
    subject: String!
    courseNumber: String!
    classNumber: String

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
  type UserRatings @cacheControl(maxAge: 1) {
    createdBy: String!
    count: Int!
    classes: [UserClass!]!
  }
  type UserClass @cacheControl(maxAge: 1) {
    "Class Identifiers"
    year: Int!
    semester: Semester!
    subject: String!
    courseNumber: String!
    classNumber: String!

    metrics: [UserMetric!]!
    lastUpdated: String
  }
  type UserMetric {
    metricName: MetricName!
    value: Int!
  }

  type SemesterRatings {
    year: Int!
    semester: Semester!
    maxMetricCount: Int!
  }

  """
  Get data
  """
  type Query {
    aggregatedRatings(
      year: Int!
      semester: Semester!
      subject: String!
      courseNumber: String!
      classNumber: String!
    ): AggregatedRatings!

    userRatings: UserRatings! @auth

    userClassRatings(
      year: Int!
      semester: Semester!
      subject: String!
      courseNumber: String!
      classNumber: String!
    ): UserClass! @auth

    semestersWithRatings(
      subject: String!
      courseNumber: String!
    ): [SemesterRatings!]!
  }

  """
  Modify data
  """
  type Mutation {
    createRating(
      "Class Identifiers"
      year: Int!
      semester: Semester!
      subject: String!
      courseNumber: String!
      classNumber: String!

      metricName: MetricName!
      value: Int!
    ): Boolean! @auth

    deleteRating(
      "Class Identifiers"
      year: Int!
      semester: Semester!
      subject: String!
      courseNumber: String!
      classNumber: String!
      metricName: MetricName!
    ): Boolean! @auth
  }
`;

export default typedef;
