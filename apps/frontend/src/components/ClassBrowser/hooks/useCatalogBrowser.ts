import { useCallback, useEffect, useMemo, useState } from "react";

import { useReadSchedules } from "@/hooks/api";
import useUser from "@/hooks/useUser";
import { ITerm } from "@/lib/api";
import { Semester } from "@/lib/generated/graphql";
import { classConflictsWithSchedule } from "@/lib/schedule/conflict";

import { FilterContextType } from "../context/FilterContext";
import { ListContextType } from "../context/ListContext";
import useCatalogFilters, {
  UseCatalogFiltersOptions,
} from "./useCatalogFilters";
import useCatalogQuery from "./useCatalogQuery";

export interface UseCatalogBrowserOptions extends UseCatalogFiltersOptions {
  year: number;
  semester: Semester;
  terms?: ITerm[];
}

export interface UseCatalogBrowserReturn {
  filters: FilterContextType;
  list: ListContextType;
  query: string;
  updateQuery: (q: string) => void;
  hasActiveFilters: boolean;
  aiSearchActive: boolean;
  setAiSearchActive: (active: boolean) => void;
  handleSemanticSearch: () => void;
  semanticLoading: boolean;
  semanticError: string | null;
  semanticSearchAvailable: boolean;
}

export default function useCatalogBrowser({
  year,
  semester,
  terms,
  persistent,
}: UseCatalogBrowserOptions): UseCatalogBrowserReturn {
  const filterState = useCatalogFilters({ persistent });

  // Check if semantic search index is ready for the current term
  const [semanticSearchAvailable, setSemanticSearchAvailable] = useState(false);
  useEffect(() => {
    setSemanticSearchAvailable(false);
    fetch("/api/semantic-search/health")
      .then((r) => r.json())
      .then((data) => {
        const indexes: { year: number; semester: string }[] = data?.indexes ?? [];
        const available = indexes.some(
          (idx) => idx.year === year && idx.semester === semester
        );
        setSemanticSearchAvailable(available);
      })
      .catch(() => setSemanticSearchAvailable(false));
  }, [year, semester]);

  // Semantic search state
  const [aiSearchActive, setAiSearchActiveState] = useState(false);
  // committedQuery is non-null only after the user has clicked "Search with AI"
  const [committedQuery, setCommittedQuery] = useState<string | null>(null);

  // Reset committed query when AI mode is turned off
  useEffect(() => {
    if (!aiSearchActive) setCommittedQuery(null);
  }, [aiSearchActive]);

  const setAiSearchActive = useCallback((active: boolean) => {
    setAiSearchActiveState(active);
  }, []);

  const handleSemanticSearch = useCallback(() => {
    setCommittedQuery(filterState.query);
  }, [filterState.query]);

  const isSemanticMode = aiSearchActive && committedQuery !== null;

  const queryResult = useCatalogQuery({
    year,
    semester,
    query: isSemanticMode ? committedQuery : filterState.query,
    sortBy: filterState.sortBy,
    effectiveOrder: filterState.effectiveOrder,
    filterVariables: filterState.filterVariables,
    semanticSearch: isSemanticMode,
  });

  // Schedule conflict filtering
  const { user } = useUser();
  const { data: schedules } = useReadSchedules({
    skip: !user || !filterState.scheduleConflictFilter,
  });

  // Find the selected schedule - must match current term to be active
  const selectedSchedule = useMemo(() => {
    if (!filterState.scheduleConflictFilter || !schedules) return null;
    const schedule = schedules.find(
      (s) => s?._id === filterState.scheduleConflictFilter
    );
    // Only use the schedule if it matches the current term
    if (!schedule || schedule.year !== year || schedule.semester !== semester) {
      return null;
    }
    return schedule;
  }, [filterState.scheduleConflictFilter, schedules, year, semester]);

  // Filter classes based on schedule conflicts
  const filteredClasses = useMemo(() => {
    if (!selectedSchedule) return queryResult.classes;

    return queryResult.classes.filter((catalogClass) => {
      // Get class meetings from the catalog class
      const meetings = catalogClass.meetings ?? [];

      // Classes without meetings don't conflict
      if (meetings.length === 0) return true;

      // Keep classes that DON'T conflict with the schedule
      return !classConflictsWithSchedule(meetings, selectedSchedule);
    });
  }, [queryResult.classes, selectedSchedule]);

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
      sortBy: filterState.sortBy,
      reverse: filterState.reverse,
      effectiveOrder: filterState.effectiveOrder,
      enrollmentFilter: filterState.enrollmentFilter,
      online: filterState.online,
      filterOptions: queryResult.filterOptions,
      scheduleConflictFilter: filterState.scheduleConflictFilter,
      updateUnits: filterState.updateUnits,
      updateLevels: filterState.updateLevels,
      updateDays: filterState.updateDays,
      updateTimeRange: filterState.updateTimeRange,
      updateBreadths: filterState.updateBreadths,
      updateUniversityRequirements: filterState.updateUniversityRequirements,
      updateGradingFilters: filterState.updateGradingFilters,
      updateSortBy: filterState.updateSortBy,
      updateEnrollmentFilter: filterState.updateEnrollmentFilter,
      updateOnline: filterState.updateOnline,
      updateReverse: filterState.updateReverse,
      updateScheduleConflictFilter: filterState.updateScheduleConflictFilter,
    }),
    [year, semester, terms, filterState, queryResult.filterOptions]
  );

  const listContextValue: ListContextType = useMemo(
    () => ({
      classes: filteredClasses,
      loading: queryResult.loading,
      // When schedule filter is active, show filtered count but keep pagination working
      // so all pages can be loaded and filtered
      totalCount: selectedSchedule
        ? filteredClasses.length
        : queryResult.totalCount,
      page: queryResult.page,
      pageSize: queryResult.pageSize,
      hasNextPage: queryResult.hasNextPage,
      loadNextPage: queryResult.loadNextPage,
      isLoadingNextPage: queryResult.isLoadingNextPage,
    }),
    [queryResult, filteredClasses, selectedSchedule]
  );

  return {
    filters: filterContextValue,
    list: listContextValue,
    query: filterState.query,
    updateQuery: filterState.updateQuery,
    hasActiveFilters: filterState.hasActiveFilters,
    aiSearchActive,
    setAiSearchActive,
    handleSemanticSearch,
    semanticLoading: queryResult.loading && isSemanticMode,
    semanticError: queryResult.semanticError,
    semanticSearchAvailable,
  };
}
