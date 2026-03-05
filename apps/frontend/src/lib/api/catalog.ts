import { gql } from "@apollo/client";

export const GET_CATALOG = gql`
  query GetCatalogServer(
    $year: Int!
    $semester: Semester!
    $search: String
    $filters: CatalogFilters
    $sortBy: CatalogSortBy
    $sortOrder: SortOrder
    $page: Int
    $pageSize: Int
  ) {
    catalog(
      year: $year
      semester: $semester
      search: $search
      filters: $filters
      sortBy: $sortBy
      sortOrder: $sortOrder
      page: $page
      pageSize: $pageSize
    ) {
      results {
        year
        semester
        termId
        sessionId
        subject
        courseNumber
        number
        courseId
        title
        description
        gradingBasis
        finalExam
        unitsMin
        unitsMax
        courseTitle
        courseDescription
        departmentNicknames
        academicCareer
        academicOrganization
        academicOrganizationName
        allTimeAverageGrade
        allTimePassCount
        allTimeNoPassCount
        primarySectionId
        primaryComponent
        primaryOnline
        sectionAttributes {
          attribute {
            code
            description
            formalDescription
          }
          value {
            code
            description
            formalDescription
          }
        }
        meetings {
          days
          startTime
          endTime
          location
          instructors {
            familyName
            givenName
          }
        }
        exams {
          date
          startTime
          endTime
          location
          type
        }
        level
        breadthRequirements
        universityRequirements
        enrollmentStatus
        enrolledCount
        maxEnroll
        waitlistedCount
        maxWaitlist
        activeReservedMaxCount
        sections {
          sectionId
          number
          component
          online
          meetings {
            days
            startTime
            endTime
            location
            instructors {
              familyName
              givenName
            }
          }
          enrollmentStatus
          enrolledCount
          maxEnroll
          waitlistedCount
          maxWaitlist
        }
        viewCount
        requirementDesignation {
          description
        }
      }
      totalCount
    }
  }
`;

export const GET_CATALOG_FILTER_OPTIONS = gql`
  query GetCatalogFilterOptions($year: Int!, $semester: Semester!) {
    catalogFilterOptions(year: $year, semester: $semester) {
      departments {
        code
        name
      }
      levels
      gradingOptions
      breadthRequirements
      universityRequirements
      semesters {
        year
        semester
      }
    }
  }
`;

// Types for the catalog query results
export interface ICatalogClassServer {
  year: number;
  semester: string;
  termId: string;
  sessionId: string;
  subject: string;
  courseNumber: string;
  number: string;
  courseId: string;
  title?: string;
  description?: string;
  gradingBasis?: string;
  finalExam?: string;
  unitsMin: number;
  unitsMax: number;
  courseTitle?: string;
  courseDescription?: string;
  departmentNicknames?: string;
  academicCareer?: string;
  academicOrganization?: string;
  academicOrganizationName?: string;
  allTimeAverageGrade?: number | null;
  allTimePassCount?: number | null;
  allTimeNoPassCount?: number | null;
  primarySectionId?: string;
  primaryComponent?: string;
  primaryOnline?: boolean;
  sectionAttributes?: {
    attribute?: { code?: string; description?: string; formalDescription?: string };
    value?: { code?: string; description?: string; formalDescription?: string };
  }[];
  meetings?: {
    days?: boolean[];
    startTime?: string;
    endTime?: string;
    location?: string;
    instructors?: { familyName?: string; givenName?: string }[];
  }[];
  exams?: {
    date?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    type?: string;
  }[];
  level?: string;
  breadthRequirements?: string[];
  universityRequirements?: string[];
  enrollmentStatus?: string;
  enrolledCount?: number;
  maxEnroll?: number;
  waitlistedCount?: number;
  maxWaitlist?: number;
  activeReservedMaxCount?: number;
  sections?: {
    sectionId: string;
    number?: string;
    component?: string;
    online?: boolean;
    meetings?: {
      days?: boolean[];
      startTime?: string;
      endTime?: string;
      location?: string;
      instructors?: { familyName?: string; givenName?: string }[];
    }[];
    enrollmentStatus?: string;
    enrolledCount?: number;
    maxEnroll?: number;
    waitlistedCount?: number;
    maxWaitlist?: number;
  }[];
  viewCount?: number;
  requirementDesignation?: { description?: string };
}

export interface ICatalogResult {
  results: ICatalogClassServer[];
  totalCount: number;
}

export interface ICatalogFilterOptions {
  departments: { code: string; name: string }[];
  levels: string[];
  gradingOptions: string[];
  breadthRequirements: string[];
  universityRequirements: string[];
  semesters: { year: number; semester: string }[];
}
