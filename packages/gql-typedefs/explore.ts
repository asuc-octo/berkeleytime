import { gql } from "graphql-tag";

export const exploreTypeDef = gql`
  type ExploreCourseSnapshot {
    courseId: CourseIdentifier!
    subject: String!
    number: CourseNumber!
    """
    Section number of the class to link to, like "001".
    """
    classNumber: String!
    """
    Session the linked class belongs to, like "1".
    """
    sessionId: String!
    title: String!
    totalRatingCount: Int!
    gradeAverage: Float
    """
    Visual cluster used to pick a card image, like "engineering".
    """
    imageCluster: String
    """
    2 open seats, 1 capacity unpublished, 0 every class full.
    """
    seatScore: Int!
    """
    UGRD, GRAD or LAW.
    """
    academicCareer: String
  }

  """
  One course in the user's viewed history. courseNumber is a catalog code.
  """
  input ExploreHistoryItem {
    subject: String!
    courseNumber: String!
  }

  """
  Recommendations for a single anchor.
  """
  type ExploreBecauseViewedGroup {
    subject: String!
    courseNumber: String!
    """
    Anchor's course title.
    """
    title: String
    courses: [ExploreCourseSnapshot!]!
  }

  type Query {
    """
    Courses with the highest all-time student rating count.
    """
    explorePopularCourses(limit: Int): [ExploreCourseSnapshot!]!
      @cacheControl(maxAge: 0)
    """
    Same as popular, restricted to normalized Berkeley subject codes.
    """
    explorePopularCoursesForSubjects(
      subjects: [String!]!
      limit: Int
    ): [ExploreCourseSnapshot!]! @cacheControl(maxAge: 0)
    """
    Staff-curated picks from every term, offered in the latest one. Unordered.
    """
    exploreCuratedHandpickedCourses: [ExploreCourseSnapshot!]!
      @cacheControl(maxAge: 0)
    """
    Courses similar to each anchor, batched into one request.
    """
    exploreBecauseYouViewedBatch(
      anchors: [ExploreHistoryItem!]!
      year: Int!
      semester: String!
      """
      Courses per rail.
      """
      limit: Int
      """
      Kept out of every rail. Defaults to the anchors when omitted.
      """
      history: [ExploreHistoryItem!]
      """
      Rails to return. Defaults to 5.
      """
      maxRows: Int
    ): [ExploreBecauseViewedGroup!]! @cacheControl(maxAge: 0)
    """
    Picks from a decay-weighted centroid of the user's viewed history.
    """
    exploreTopPicks(
      history: [ExploreHistoryItem!]!
      year: Int!
      semester: String!
      limit: Int
    ): [ExploreCourseSnapshot!]! @cacheControl(maxAge: 0)
  }
`;
