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
        sessionId
        subject
        courseNumber
        number
        title
        unitsMin
        unitsMax
        courseTitle
        allTimeAverageGrade
        allTimePassCount
        allTimeNoPassCount
        enrolledCount
        maxEnroll
        activeReservedMaxCount
        aggregatedRatings {
          metrics {
            metricName
            count
            weightedAverage
          }
        }
      }
      totalCount
    }
  }
`;

export const GET_CATALOG_FILTER_OPTIONS = gql`
  query GetCatalogFilterOptions($year: Int!, $semester: Semester!) {
    catalogFilterOptions(year: $year, semester: $semester) {
      levels
      gradingOptions
      breadthRequirements
      universityRequirements
      timeRange {
        minStartTime
        maxEndTime
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
