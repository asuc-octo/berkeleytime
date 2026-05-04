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

export const CREATE_RATINGS = gql`
  mutation CreateRatings(
    $subject: String!
    $courseNumber: String!
    $semester: Semester!
    $year: Int!
    $classNumber: String!
    $metrics: [RatingMetricInput!]!
    $reviewTitle: String
    $reviewContent: String
    $reviewerGrade: String
  ) {
    createRatings(
      subject: $subject
      courseNumber: $courseNumber
      semester: $semester
      year: $year
      classNumber: $classNumber
      metrics: $metrics
      reviewTitle: $reviewTitle
      reviewContent: $reviewContent
      reviewerGrade: $reviewerGrade
    )
  }
`;

export const DELETE_RATINGS = gql`
  mutation DeleteRatings($subject: String!, $courseNumber: String!) {
    deleteRatings(subject: $subject, courseNumber: $courseNumber)
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
        reviewTitle
        reviewContent
        reviewerGrade
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

export const GET_CLASS_RATINGS_DATA = gql`
  query GetClassRatingsData(
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
      instructorAggregatedRatings {
        instructor {
          givenName
          familyName
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
      classes(printInScheduleOnly: true) {
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
    semestersWithRatings(subject: $subject, courseNumber: $courseNumber) {
      semester
      year
      maxMetricCount
    }
  }
`;

export const GET_ALL_RATINGS = gql`
  query GetAllRatings {
    allRatings {
      anonymousUserId
      subject
      courseNumber
      semester
      year
      classNumber
      metricName
      value
      createdAt
    }
  }
`;

export const GET_CLASS_REVIEWS = gql`
  query GetClassReviews($subject: String!, $courseNumber: String!) {
    classReviews(subject: $subject, courseNumber: $courseNumber) {
      subject
      courseNumber
      count
      users {
        anonymousUserId
        classes {
          subject
          courseNumber
          semester
          year
          classNumber
          professorName
          metrics {
            metricName
            value
          }
          reviewTitle
          reviewContent
          reviewerGrade
          lastUpdated
          reviewId
          helpfulCount
        }
      }
    }
  }
`;

export const VOTE_REVIEW_HELPFUL = gql`
  mutation VoteReviewHelpful($reviewId: String!) {
    voteReviewHelpful(reviewId: $reviewId)
  }
`;

export type IUserRatings = NonNullable<GetUserRatingsQuery["userRatings"]>;
