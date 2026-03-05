import { gql } from "@apollo/client";

import type {
  GetCatalogFilterOptionsQuery,
  GetCatalogServerQuery,
  GetCatalogServerQueryVariables,
} from "../generated/graphql";

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
        aggregatedRatings {
          metrics {
            metricName
            count
            weightedAverage
          }
        }
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

export type ICatalogResult = NonNullable<GetCatalogServerQuery["catalog"]>;

export type ICatalogClassServer = ICatalogResult["results"][number];

export type ICatalogFilterOptions = NonNullable<
  GetCatalogFilterOptionsQuery["catalogFilterOptions"]
>;

export type ICatalogFilters = GetCatalogServerQueryVariables["filters"];
