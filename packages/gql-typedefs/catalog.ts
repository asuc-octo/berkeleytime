import { gql } from "graphql-tag";

export const catalogTypeDef = gql`
  enum CatalogSortBy {
    RELEVANCE
    UNITS
    AVERAGE_GRADE
    OPEN_SEATS
  }

  enum SortOrder {
    ASC
    DESC
  }

  enum EnrollmentFilterType {
    OPEN
    NON_RESERVED_OPEN
    WAITLIST_OPEN
  }

  input CatalogFilters {
    levels: [String!]
    departments: [String!]
    unitsMin: Float
    unitsMax: Float
    days: [Int!]
    timeFrom: String
    timeTo: String
    enrollmentFilter: EnrollmentFilterType
    gradingFilters: [String!]
    breadths: [String!]
    universityRequirements: [String!]
    "College of Engineering Humanities and Social Sciences course eligibility."
    coeHss: Boolean
    online: Boolean
  }

  type CatalogMeeting @cacheControl(inheritMaxAge: true) {
    days: [Boolean!]
    startTime: String
    endTime: String
    location: String
    instructors: [CatalogInstructor!]!
  }

  type CatalogInstructor @cacheControl(inheritMaxAge: true) {
    familyName: String
    givenName: String
  }

  type CatalogExam @cacheControl(inheritMaxAge: true) {
    date: String
    startTime: String
    endTime: String
    location: String
    type: String
  }

  type CatalogSectionAttribute @cacheControl(inheritMaxAge: true) {
    attribute: SectionAttributeInfo @cacheControl(inheritMaxAge: true)
    value: SectionAttributeInfo @cacheControl(inheritMaxAge: true)
  }

  type CatalogSectionEnrollment @cacheControl(inheritMaxAge: true) {
    enrollmentStatus: String
    enrolledCount: Int
    maxEnroll: Int
    waitlistedCount: Int
    maxWaitlist: Int
  }

  type CatalogSection @cacheControl(inheritMaxAge: true) {
    sectionId: String!
    number: String
    component: String
    online: Boolean
    meetings: [CatalogMeeting!]
    enrollmentStatus: String
    enrolledCount: Int
    maxEnroll: Int
    waitlistedCount: Int
    maxWaitlist: Int
  }

  type CatalogDeCal @cacheControl(inheritMaxAge: true) {
    title: String
  }

  type CatalogMetric @cacheControl(inheritMaxAge: true) {
    metricName: String!
    count: Int!
    weightedAverage: Float!
  }

  type CatalogAggregatedRatings @cacheControl(inheritMaxAge: true) {
    metrics: [CatalogMetric!]!
  }

  type CatalogClass @cacheControl(inheritMaxAge: true) {
    "Identity"
    year: Int!
    semester: String!
    termId: String!
    sessionId: String!
    subject: String!
    courseNumber: String!
    number: String!
    courseId: String!

    "Class fields"
    title: String
    description: String
    gradingBasis: String
    finalExam: String
    unitsMin: Float!
    unitsMax: Float!

    "Course fields"
    courseTitle: String
    courseDescription: String
    departmentNicknames: String
    academicCareer: String
    academicOrganization: String
    academicOrganizationName: String
    allTimeAverageGrade: Float
    allTimePassCount: Int
    allTimeNoPassCount: Int

    "Primary section"
    primarySectionId: String
    primaryComponent: String
    primaryOnline: Boolean
    sectionAttributes: [CatalogSectionAttribute!]
    meetings: [CatalogMeeting!]
    exams: [CatalogExam!]

    "Pre-computed"
    level: String
    breadthRequirements: [String!]
    universityRequirements: [String!]

    "Enrollment"
    enrollmentStatus: String
    enrolledCount: Int
    maxEnroll: Int
    waitlistedCount: Int
    maxWaitlist: Int
    activeReservedMaxCount: Int

    "DeCal"
    decal: CatalogDeCal

    "Secondary sections"
    sections: [CatalogSection!]

    "Pre-computed sort"
    openSeats: Int

    "Stats"
    viewCount: Int
    aggregatedRatings: CatalogAggregatedRatings

    "Requirement designation"
    requirementDesignation: SectionAttributeInfo
      @cacheControl(inheritMaxAge: true)
  }

  type CatalogResult @cacheControl(inheritMaxAge: true) {
    results: [CatalogClass!]!

    """
    Total matching classes. Without a search, populated only when page is 1
    and 0 otherwise.
    """
    totalCount: Int!
  }

  type CatalogDepartment @cacheControl(inheritMaxAge: true) {
    code: String!
    name: String!
  }

  type CatalogTimeRange @cacheControl(inheritMaxAge: true) {
    minStartTime: String!
    maxEndTime: String!
  }

  type CatalogFilterOptions @cacheControl(inheritMaxAge: true) {
    departments: [CatalogDepartment!]!
    levels: [String!]!
    gradingOptions: [String!]!
    breadthRequirements: [String!]!
    universityRequirements: [String!]!
    semesters: [CatalogSemester!]!
    timeRange: CatalogTimeRange
  }

  type CatalogSemester @cacheControl(inheritMaxAge: true) {
    year: Int!
    semester: String!
  }

  type CatalogClassIdentity @cacheControl(inheritMaxAge: true) {
    subject: String!
    courseNumber: String!
    number: String!
    sessionId: String!
  }

  type Query {
    catalog(year: Int!, semester: Semester!): [Class!]!

    catalogSearch(
      year: Int!
      semester: Semester!
      search: String
      filters: CatalogFilters
      sortBy: CatalogSortBy
      sortOrder: SortOrder
      page: Int
      pageSize: Int
      semanticSearch: Boolean
    ): CatalogResult! @cacheControl(maxAge: 300, scope: PUBLIC)

    catalogClassIdentities(
      year: Int!
      semester: Semester!
    ): [CatalogClassIdentity!]! @cacheControl(maxAge: 300, scope: PUBLIC)

    catalogFilterOptions(
      year: Int!
      semester: Semester!
    ): CatalogFilterOptions! @cacheControl(maxAge: 3600, scope: PUBLIC)
  }
`;
