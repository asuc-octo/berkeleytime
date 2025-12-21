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
