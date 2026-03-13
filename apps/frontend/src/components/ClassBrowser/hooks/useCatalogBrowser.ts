import { useCallback, useEffect, useMemo, useState } from "react";

import { ITerm } from "@/lib/api";
import { Semester } from "@/lib/generated/graphql";

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
}

export default function useCatalogBrowser({
  year,
  semester,
  terms,
  persistent,
}: UseCatalogBrowserOptions): UseCatalogBrowserReturn {
  const filterState = useCatalogFilters({ persistent });

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
    aiSearchActive,
    setAiSearchActive,
    handleSemanticSearch,
    semanticLoading: queryResult.loading && isSemanticMode,
    semanticError: queryResult.semanticError,
  };
}
