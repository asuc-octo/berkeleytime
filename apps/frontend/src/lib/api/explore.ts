import { gql } from "@apollo/client";

export const EXPLORE_SNAPSHOT_ROW_LIMIT = 20;

export const GET_EXPLORE_POPULAR = gql`
  query GetExplorePopular($limit: Int) {
    explorePopularCourses(limit: $limit) {
      courseId
      subject
      number
      classNumber
      sessionId
      title
      totalRatingCount
      gradeAverage
      imageCluster
      seatScore
    }
  }
`;

export const GET_EXPLORE_CURATED_HANDPICK = gql`
  query GetExploreCuratedHandpick {
    exploreCuratedHandpickedCourses {
      courseId
      subject
      number
      classNumber
      sessionId
      title
      totalRatingCount
      gradeAverage
      imageCluster
      seatScore
    }
  }
`;

export const GET_EXPLORE_BECAUSE_YOU_VIEWED_BATCH = gql`
  query GetExploreBecauseYouViewedBatch(
    $anchors: [ExploreHistoryItem!]!
    $year: Int!
    $semester: String!
    $limit: Int
    $history: [ExploreHistoryItem!]
    $maxRows: Int
  ) {
    exploreBecauseYouViewedBatch(
      anchors: $anchors
      year: $year
      semester: $semester
      limit: $limit
      history: $history
      maxRows: $maxRows
    ) {
      subject
      courseNumber
      title
      courses {
        courseId
        subject
        number
        classNumber
        sessionId
        title
        totalRatingCount
        gradeAverage
        imageCluster
        seatScore
      }
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
      classNumber
      sessionId
      title
      totalRatingCount
      gradeAverage
      imageCluster
      seatScore
    }
  }
`;
