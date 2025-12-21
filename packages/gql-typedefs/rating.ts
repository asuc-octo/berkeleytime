import { gql } from "graphql-tag";

export const ratingTypeDef = gql`
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
  Instructor information
  """
  type Instructor {
    givenName: String!
    familyName: String!
  }

  """
  Ratings by instructor
  """
  type InstructorRating @cacheControl(maxAge: 1) {
    instructor: Instructor!
    aggregatedRatings: AggregatedRatings!
    classesTaught: [ClassIdentifier!]!
  }

  type ClassIdentifier {
    semester: Semester!
    year: Int!
    classNumber: String!
  }

  """
  Ratings by user
  """
  type UserRatings @cacheControl(maxAge: 1) {
    createdBy: String!
    count: Int!
    classes: [UserClass!]!
  }
  type UserClass {
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

  type RawRating {
    anonymousUserId: String!
    subject: String!
    courseNumber: String!
    semester: Semester!
    year: Int!
    classNumber: String!
    metricName: MetricName!
    value: Int!
    createdAt: String!
  }

  """
  Minimal rating data point for analytics timeseries
  Contains only the data needed to compute growth metrics
  """
  type RatingDataPoint @cacheControl(maxAge: 0) {
    "Timestamp when the rating was created"
    createdAt: String!
    "User email for counting unique users"
    userEmail: String!
    "Course identifier (subject + courseNumber)"
    courseKey: String!
  }

  """
  Rating metric data point for analytics
  Contains metric name and value for computing average scores over time
  """
  type RatingMetricDataPoint @cacheControl(maxAge: 0) {
    "Timestamp when the rating was created"
    createdAt: String!
    "The metric name (Usefulness, Difficulty, Workload)"
    metricName: MetricName!
    "The rating value (1-5)"
    value: Int!
    "Course identifier (subject + courseNumber)"
    courseKey: String!
  }

  """
  Optional response data point for analytics
  Indicates whether optional fields (Recording, Attendance) were filled for a rating submission
  """
  type OptionalResponseDataPoint @cacheControl(maxAge: 0) {
    "Timestamp when the rating was created"
    createdAt: String!
    "Whether at least one optional field was filled"
    hasOptional: Boolean!
  }

  input ClassWithoutCourseInput {
    year: Int!
    semester: Int!
    classNumber: String!
  }

  input RatingMetricInput {
    metricName: MetricName!
    value: Int!
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
      classNumber: String
    ): AggregatedRatings!

    multipleClassAggregatedRatings(
      subject: String!
      courseNumber: String!
      classes: [ClassWithoutCourseInput!]!
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

    "All raw ratings with anonymized user IDs"
    allRatings: [RawRating!]!

    "Staff-only: Rating data points for analytics timeseries"
    ratingAnalyticsData: [RatingDataPoint!]! @auth

    "Staff-only: Rating metric values for analytics (average scores over time)"
    ratingMetricsAnalyticsData: [RatingMetricDataPoint!]! @auth

    "Staff-only: Optional response data for analytics (Recording/Attendance completion)"
    optionalResponseAnalyticsData: [OptionalResponseDataPoint!]! @auth
  }

  """
  Modify data
  """
  type Mutation {
    createRatings(
      "Class Identifiers"
      year: Int!
      semester: Semester!
      subject: String!
      courseNumber: String!
      classNumber: String!

      metrics: [RatingMetricInput!]!
    ): Boolean! @auth

    deleteRatings(subject: String!, courseNumber: String!): Boolean! @auth
  }
`;
