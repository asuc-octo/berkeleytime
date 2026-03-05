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
    online: Boolean
  }

  type CatalogMeeting {
    days: [Boolean!]
    startTime: String
    endTime: String
    location: String
    instructors: [CatalogInstructor!]!
  }

  type CatalogInstructor {
    familyName: String
    givenName: String
  }

  type CatalogExam {
    date: String
    startTime: String
    endTime: String
    location: String
    type: String
  }

  type CatalogSectionAttribute {
    attribute: SectionAttributeInfo
    value: SectionAttributeInfo
  }

  type CatalogSectionEnrollment {
    enrollmentStatus: String
    enrolledCount: Int
    maxEnroll: Int
    waitlistedCount: Int
    maxWaitlist: Int
  }

  type CatalogSection {
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

  type CatalogClass {
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

    "Secondary sections"
    sections: [CatalogSection!]

    "Stats"
    viewCount: Int

    "Requirement designation"
    requirementDesignation: SectionAttributeInfo
  }

  type CatalogResult {
    results: [CatalogClass!]!
    totalCount: Int!
  }

  type CatalogDepartment {
    code: String!
    name: String!
  }

  type CatalogFilterOptions {
    departments: [CatalogDepartment!]!
    levels: [String!]!
    gradingOptions: [String!]!
    breadthRequirements: [String!]!
    universityRequirements: [String!]!
    semesters: [CatalogSemester!]!
  }

  type CatalogSemester {
    year: Int!
    semester: String!
  }

  type Query {
    catalog(
      year: Int!
      semester: Semester!
      search: String
      filters: CatalogFilters
      sortBy: CatalogSortBy
      sortOrder: SortOrder
      page: Int
      pageSize: Int
    ): CatalogResult!

    catalogFilterOptions(year: Int!, semester: Semester!): CatalogFilterOptions!
  }
`;
