import { gql } from "@apollo/client";

export const EXPLORE_SNAPSHOT_ROW_LIMIT = 20;

export const GET_EXPLORE_POPULAR = gql`
  query GetExplorePopular($limit: Int) {
    explorePopularCourses(limit: $limit) {
      courseId
      subject
      number
      title
      totalRatingCount
      gradeAverage
      imageUrl
    }
  }
`;

export const GET_EXPLORE_CURATED_HANDPICK = gql`
  query GetExploreCuratedHandpick {
    exploreCuratedHandpickedCourses {
      courseId
      subject
      number
      title
      totalRatingCount
      gradeAverage
      imageUrl
    }
  }
`;

export const GET_EXPLORE_BECAUSE_YOU_VIEWED = gql`
  query GetExploreBecauseYouViewed(
    $subject: String!
    $courseNumber: String!
    $year: Int!
    $semester: String!
    $limit: Int
  ) {
    exploreBecauseYouViewed(
      subject: $subject
      courseNumber: $courseNumber
      year: $year
      semester: $semester
      limit: $limit
    ) {
      courseId
      subject
      number
      title
      totalRatingCount
      gradeAverage
      imageUrl
    }
  }
`;

export const GET_EXPLORE_TOP_PICKS = gql`
  query GetExploreTopPicks(
    $history: [ExploreHistoryItem!]!
    $year: Int!
    $semester: String!
    $limit: Int
  ) {
    exploreTopPicks(
      history: $history
      year: $year
      semester: $semester
      limit: $limit
    ) {
      courseId
      subject
      number
      title
      totalRatingCount
      gradeAverage
      imageUrl
    }
  }
`;
