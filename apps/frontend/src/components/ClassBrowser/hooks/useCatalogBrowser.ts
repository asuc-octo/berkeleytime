import { useEffect, useMemo } from "react";

import { ITerm } from "@/lib/api";
import { Semester } from "@/lib/generated/graphql";

import { FilterContextType } from "../context/FilterContext";
import { ListContextType } from "../context/ListContext";
import useCatalogFilters, { UseCatalogFiltersOptions } from "./useCatalogFilters";
import useCatalogQuery from "./useCatalogQuery";

export interface UseCatalogBrowserOptions extends UseCatalogFiltersOptions {
  year: number;
  semester: Semester;
  terms?: ITerm[];
  onLoadingChange?: (loading: boolean) => void;
  onCatalogClassAvailabilityChange?: (
    classes: {
      subject: string;
      courseNumber: string;
      number: string;
      sessionId: string;
    }[]
  ) => void;
}

export interface UseCatalogBrowserReturn {
  filters: FilterContextType;
  list: ListContextType;
  query: string;
  updateQuery: (q: string) => void;
  hasActiveFilters: boolean;
}

export default function useCatalogBrowser({
  year,
  semester,
  terms,
  persistent,
  onLoadingChange,
  onCatalogClassAvailabilityChange,
}: UseCatalogBrowserOptions): UseCatalogBrowserReturn {
  const filterState = useCatalogFilters({ persistent });

  const queryResult = useCatalogQuery({
    year,
    semester,
    query: filterState.query,
    sortBy: filterState.sortBy,
    effectiveOrder: filterState.effectiveOrder,
    filterVariables: filterState.filterVariables,
  });

  useEffect(() => {
    onLoadingChange?.(queryResult.shouldShowCatalogOverlay);
  }, [onLoadingChange, queryResult.shouldShowCatalogOverlay]);

  useEffect(() => {
    const availabilityClasses = queryResult.classes.map((_class) => ({
      subject: _class.subject,
      courseNumber: _class.courseNumber,
      number: _class.number,
      sessionId: _class.sessionId,
    }));
    onCatalogClassAvailabilityChange?.(availabilityClasses);
  }, [onCatalogClassAvailabilityChange, queryResult.classes]);

  const filterContextValue: FilterContextType = useMemo(
    () => ({
      year,
      semester,
      terms,
      units: filterState.units,
      levels: filterState.levels,
      days: filterState.days,
      timeRange: filterState.timeRange,
      breadths: filterState.breadths,
      universityRequirements: filterState.universityRequirements,
      gradingFilters: filterState.gradingFilters,
      academicOrganization: filterState.academicOrganization,
      sortBy: filterState.sortBy,
      reverse: filterState.reverse,
      effectiveOrder: filterState.effectiveOrder,
      enrollmentFilter: filterState.enrollmentFilter,
      online: filterState.online,
      filterOptions: queryResult.filterOptions,
      updateUnits: filterState.updateUnits,
      updateLevels: filterState.updateLevels,
      updateDays: filterState.updateDays,
      updateTimeRange: filterState.updateTimeRange,
      updateBreadths: filterState.updateBreadths,
      updateUniversityRequirements: filterState.updateUniversityRequirements,
      updateGradingFilters: filterState.updateGradingFilters,
      updateAcademicOrganization: filterState.updateAcademicOrganization,
      updateSortBy: filterState.updateSortBy,
      updateEnrollmentFilter: filterState.updateEnrollmentFilter,
      updateOnline: filterState.updateOnline,
      updateReverse: filterState.updateReverse,
    }),
    [year, semester, terms, filterState, queryResult.filterOptions]
  );

  const listContextValue: ListContextType = useMemo(
    () => ({
      classes: queryResult.classes,
      loading: queryResult.loading,
      totalCount: queryResult.totalCount,
      page: queryResult.page,
      pageSize: queryResult.pageSize,
      hasNextPage: queryResult.hasNextPage,
      loadNextPage: queryResult.loadNextPage,
      isLoadingNextPage: queryResult.isLoadingNextPage,
    }),
    [queryResult]
  );

  return {
    filters: filterContextValue,
    list: listContextValue,
    query: filterState.query,
    updateQuery: filterState.updateQuery,
    hasActiveFilters: filterState.hasActiveFilters,
  };
}
