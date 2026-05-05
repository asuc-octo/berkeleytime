import { gql } from "graphql-tag";

export const exploreTypeDef = gql`
  type ExploreCourseSnapshot {
    courseId: CourseIdentifier!
    subject: String!
    number: CourseNumber!
    title: String!
    totalRatingCount: Int!
    gradeAverage: Float
    imageUrl: String
  }

  """
  A single course in the user's viewed history, identified by subject and catalog course code.
  courseNumber matches courseEmbeddings.courseId (e.g. "C100", "61A").
  """
  input ExploreHistoryItem {
    subject: String!
    courseNumber: String!
  }

  type Query {
    """
    Courses with the highest all-time student rating count, joined to latest catalog rows.
    """
    explorePopularCourses(limit: Int): [ExploreCourseSnapshot!]!
      @cacheControl(maxAge: 0)
    """
    Same as popular, restricted to Berkeley subject codes (normalized). For topical discovery rails.
    """
    explorePopularCoursesForSubjects(
      subjects: [String!]!
      limit: Int
    ): [ExploreCourseSnapshot!]! @cacheControl(maxAge: 0)
    """
    Curated picks de-duplicated to the course level, limited to courses that have at least one
    class printed in the schedule for the latest term with catalog data (same default term as the catalog).
    Unordered—clients may shuffle and sample.
    """
    exploreCuratedHandpickedCourses: [ExploreCourseSnapshot!]!
    """
    Courses semantically similar to a single anchor course the user recently viewed.
    courseNumber is the catalog course code (e.g. "C100") matching courseEmbeddings.courseId.
    Returns empty list when the anchor has no embedding for the given term.
    """
    exploreBecauseYouViewed(
      subject: String!
      courseNumber: String!
      year: Int!
      semester: String!
      limit: Int
    ): [ExploreCourseSnapshot!]! @cacheControl(maxAge: 0)
    """
    Personalized picks based on a decay-weighted centroid of the user's viewed course history.
    history items use the same catalog course code as exploreBecauseYouViewed.
    Returns empty list when none of the history courses have embeddings for the given term.
    """
    exploreTopPicks(
      history: [ExploreHistoryItem!]!
      year: Int!
      semester: String!
      limit: Int
    ): [ExploreCourseSnapshot!]! @cacheControl(maxAge: 0)
  }
`;
