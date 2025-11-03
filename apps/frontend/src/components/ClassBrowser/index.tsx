import { useEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "@apollo/client/react";
import classNames from "classnames";
import { useSearchParams } from "react-router-dom";

import {
  Component,
  GET_CATALOG,
  GetCatalogResponse,
  IClass,
  ITerm,
  Semester,
} from "@/lib/api";

import styles from "./ClassBrowser.module.scss";
import Filters from "./Filters";
import List from "./List";
import {
  Breadth,
  Day,
  Level,
  SortBy,
  UnitRange,
  UniversityRequirement,
  getFilteredClasses,
  getIndex,
} from "./browser";
import BrowserContext from "./browserContext";
import { searchAndSortClasses } from "./searchAndSort";

// Pagination constants
const INITIAL_LOAD_SIZE = 100;
const AUTO_LOAD_BATCH_SIZE = 1000;
const AUTO_LOAD_DELAY_MS = 1000;
const AUTO_LOAD_START_DELAY_MS = 300;

const DEFAULT_SORT_ORDER: Record<SortBy, "asc" | "desc"> = {
  [SortBy.Relevance]: "asc",
  [SortBy.Units]: "asc",
  [SortBy.AverageGrade]: "desc",
  [SortBy.OpenSeats]: "desc",
  [SortBy.PercentOpenSeats]: "desc",
};

const getEffectiveOrder = (
  sortBy: SortBy,
  reverse: boolean
): "asc" | "desc" => {
  const defaultOrder = DEFAULT_SORT_ORDER[sortBy] ?? "asc";

  if (!reverse) return defaultOrder;

  return defaultOrder === "asc" ? "desc" : "asc";
};

interface ClassBrowserProps {
  onSelect: (subject: string, courseNumber: string, number: string) => void;
  responsive?: boolean;
  semester: Semester;
  year: number;
  terms?: ITerm[];
  persistent?: boolean;
}

export default function ClassBrowser({
  onSelect,
  responsive = true,
  semester: currentSemester,
  year: currentYear,
  terms,
  persistent,
}: ClassBrowserProps) {
  const [expanded, setExpanded] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [localQuery, setLocalQuery] = useState<string>(() =>
    persistent ? (searchParams.get("query") ?? "") : ""
  );
  const [localComponents, setLocalComponents] = useState<Component[]>([]);
  const [localUnits, setLocalUnits] = useState<UnitRange>([0, 5]);
  const [localLevels, setLocalLevels] = useState<Level[]>([]);
  const [localDays, setLocalDays] = useState<Day[]>([]);
  const [localBreadths, setLocalBreadths] = useState<Breadth[]>([]);
  const [localUniversityRequirement, setLocalUniversityRequirement] =
    useState<UniversityRequirement | null>(null);
  const [localSortBy, setLocalSortBy] = useState<SortBy>(SortBy.Relevance);
  const [localReverse, setLocalReverse] = useState<boolean>(false);
  const [localOpen, setLocalOpen] = useState<boolean>(false);
  const [localOnline, setLocalOnline] = useState<boolean>(false);

  const query = localQuery;

  const { data, loading, fetchMore } = useQuery<GetCatalogResponse>(
    GET_CATALOG,
    {
      variables: {
        semester: currentSemester,
        year: currentYear,
        limit: INITIAL_LOAD_SIZE,
        offset: 0,
      },
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    }
  );

  const classes = useMemo(() => data?.catalog.classes ?? [], [data]);
  const totalCount = data?.catalog.totalCount ?? 0;

  // Auto-load all remaining data in background
  const isLoadingAllRef = useRef(false);
  const loadedCountRef = useRef(0);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);

  useEffect(() => {
    loadedCountRef.current = classes.length;
  }, [classes.length]);

  useEffect(() => {
    // Prevent multiple simultaneous loads
    if (isLoadingAllRef.current) return;
    if (!totalCount || totalCount === 0) return;
    if (loadedCountRef.current >= totalCount) return;

    const loadAllData = async () => {
      isLoadingAllRef.current = true;
      setIsBackgroundLoading(true);

      try {
        while (loadedCountRef.current < totalCount) {
          const remainingCount = totalCount - loadedCountRef.current;
          const loadSize = Math.min(AUTO_LOAD_BATCH_SIZE, remainingCount);

          await fetchMore({
            variables: {
              offset: loadedCountRef.current,
              limit: loadSize,
            },
          });

          // Delay between batches to avoid blocking UI
          await new Promise((resolve) =>
            setTimeout(resolve, AUTO_LOAD_DELAY_MS)
          );
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        isLoadingAllRef.current = false;
        setIsBackgroundLoading(false);
      }
    };

    // Start loading after initial render
    const timer = setTimeout(loadAllData, AUTO_LOAD_START_DELAY_MS);
    return () => clearTimeout(timer);
  }, [totalCount, fetchMore]); // Only trigger once when totalCount is known

  const components = useMemo(
    () =>
      persistent
        ? ((searchParams
            .get("components")
            ?.split(",")
            .filter((component) =>
              Object.values(Component).includes(component as Component)
            ) ?? []) as Component[])
        : localComponents,
    [searchParams, localComponents, persistent]
  );

  const units = useMemo((): UnitRange => {
    if (!persistent) return localUnits;

    const unitsParam = searchParams.get("units");
    if (!unitsParam) return [0, 5];

    const parts = unitsParam.split("-").map(Number);
    if (parts.length === 2 && !parts.some(isNaN)) {
      return [parts[0], parts[1]];
    }

    return [0, 5];
  }, [searchParams, localUnits, persistent]);

  const levels = useMemo(
    () =>
      persistent
        ? ((searchParams
            .get("levels")
            ?.split(",")
            .filter((level) => Object.values(Level).includes(level as Level)) ??
            []) as Level[])
        : localLevels,
    [searchParams, localLevels, persistent]
  );

  const days = useMemo(
    () =>
      persistent
        ? ((searchParams
            .get("days")
            ?.split(",")
            .filter((day) => Object.values(Day).includes(day as Day)) ??
            []) as Day[])
        : localDays,
    [searchParams, localDays, persistent]
  );

  const breadths = useMemo(
    () =>
      persistent
        ? (searchParams.get("breadths")?.split(",") ?? [])
        : localBreadths,
    [searchParams, localBreadths, persistent]
  );

  const universityRequirement = useMemo(
    () =>
      persistent
        ? (searchParams.get("universityRequirement") ?? null)
        : localUniversityRequirement,
    [searchParams, localUniversityRequirement, persistent]
  );

  const sortBy = useMemo(() => {
    if (persistent) {
      const parameter = searchParams.get("sortBy") as SortBy;

      return Object.values(SortBy).includes(parameter)
        ? parameter
        : SortBy.Relevance;
    }

    return localSortBy;
  }, [searchParams, localSortBy, persistent]);

  const effectiveOrder = useMemo(
    () => getEffectiveOrder(sortBy, localReverse),
    [sortBy, localReverse]
  );
  useEffect(() => {
    setLocalReverse(false);
  }, [sortBy]);

  const open = useMemo(
    () => (persistent ? searchParams.has("open") : localOpen),
    [searchParams, localOpen, persistent]
  );

  const online = useMemo(
    () => (persistent ? searchParams.has("online") : localOnline),
    [searchParams, localOnline, persistent]
  );

  // Incremental filtering and sorting for performance
  // Only process new classes, not the entire dataset every time
  const previousClassesCountRef = useRef(0);
  const processedIncludedRef = useRef<IClass[]>([]);
  const processedExcludedRef = useRef<IClass[]>([]);
  const previousFiltersRef = useRef({
    query,
    year: currentYear,
    semester: currentSemester,
    components,
    units,
    levels,
    days,
    open,
    online,
    breadths,
    universityRequirement,
  });

  const { includedClasses, excludedClasses, isFiltersChanged } = useMemo(() => {
    const previousCount = previousClassesCountRef.current;
    const currentCount = classes.length;

    // Check if any filter changed (including query, year, semester)
    const filtersChanged =
      previousFiltersRef.current.query !== query ||
      previousFiltersRef.current.year !== currentYear ||
      previousFiltersRef.current.semester !== currentSemester ||
      previousFiltersRef.current.components !== components ||
      previousFiltersRef.current.units !== units ||
      previousFiltersRef.current.levels !== levels ||
      previousFiltersRef.current.days !== days ||
      previousFiltersRef.current.open !== open ||
      previousFiltersRef.current.online !== online ||
      previousFiltersRef.current.breadths !== breadths ||
      previousFiltersRef.current.universityRequirement !==
        universityRequirement;

    // If filters changed, first load, or data reset, reprocess everything
    if (filtersChanged || previousCount === 0 || currentCount < previousCount) {
      previousFiltersRef.current = {
        query,
        year: currentYear,
        semester: currentSemester,
        components,
        units,
        levels,
        days,
        open,
        online,
        breadths,
        universityRequirement,
      };
      const result = getFilteredClasses(
        classes,
        components,
        units,
        levels,
        days,
        open,
        online,
        breadths,
        universityRequirement
      );
      processedIncludedRef.current = result.includedClasses;
      processedExcludedRef.current = result.excludedClasses;
      previousClassesCountRef.current = currentCount;
      return {
        ...result,
        isFiltersChanged: filtersChanged,
      };
    }

    // Only process new classes (incremental)
    if (currentCount > previousCount) {
      const newClasses = classes.slice(previousCount);
      const newFiltered = getFilteredClasses(
        newClasses,
        components,
        units,
        levels,
        days,
        open,
        online,
        breadths,
        universityRequirement
      );

      // Append new results
      processedIncludedRef.current = [
        ...processedIncludedRef.current,
        ...newFiltered.includedClasses,
      ];
      processedExcludedRef.current = [
        ...processedExcludedRef.current,
        ...newFiltered.excludedClasses,
      ];
      previousClassesCountRef.current = currentCount;
    }

    return {
      includedClasses: processedIncludedRef.current,
      excludedClasses: processedExcludedRef.current,
      isFiltersChanged: false,
    };
  }, [
    classes,
    query,
    currentYear,
    currentSemester,
    components,
    units,
    levels,
    days,
    open,
    online,
    breadths,
    universityRequirement,
  ]);

  const index = useMemo(() => getIndex(includedClasses), [includedClasses]);

  const filteredClasses = useMemo(
    () =>
      searchAndSortClasses({
        classes: includedClasses,
        index,
        query,
        sortBy,
        order: effectiveOrder,
      }),
    [includedClasses, index, query, sortBy, effectiveOrder]
  );

  const updateArray = <T,>(
    key: string,
    setState: (state: T[]) => void,
    state: T[]
  ) => {
    if (persistent) {
      if (state.length > 0) {
        const value = state.join(",");
        searchParams.set(key, value);
      } else {
        searchParams.delete(key);
      }

      setSearchParams(searchParams);

      return;
    }

    setState(state);
  };

  const updateBoolean = (
    key: string,
    setState: (state: boolean) => void,
    value: boolean
  ) => {
    if (persistent) {
      if (value) searchParams.set(key, "");
      else searchParams.delete(key);
      setSearchParams(searchParams);

      return;
    }

    setState(value);
  };

  const updateRange = (
    key: string,
    setState: (state: UnitRange) => void,
    value: UnitRange
  ) => {
    if (persistent) {
      // Check if range is default [0, 5]
      if (value[0] === 0 && value[1] === 5) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, `${value[0]}-${value[1]}`);
      }
      setSearchParams(searchParams);

      return;
    }

    setState(value);
  };

  const updateSortBy = (value: SortBy) => {
    setLocalReverse(false);
    if (persistent) {
      if (value === SortBy.Relevance) searchParams.delete("sortBy");
      else searchParams.set("sortBy", value);
      setSearchParams(searchParams);

      return;
    }

    setLocalSortBy(value);
  };

  const updateUniversityRequirement = (
    universityRequirement: UniversityRequirement | null
  ) => {
    if (persistent) {
      if (universityRequirement) {
        searchParams.set("universityRequirement", universityRequirement);
      } else {
        searchParams.delete("universityRequirement");
      }
      setSearchParams(searchParams);
      return;
    }
    setLocalUniversityRequirement(universityRequirement);
  };

  const updateQuery = (query: string) => {
    setLocalQuery(query);
  };

  return (
    <BrowserContext
      value={{
        expanded,
        responsive,
        sortBy,
        classes: filteredClasses,
        includedClasses,
        excludedClasses,
        year: currentYear,
        semester: currentSemester,
        terms,
        query,
        components,
        units,
        levels,
        days,
        breadths,
        universityRequirement,
        online,
        open,
        reverse: localReverse,
        effectiveOrder,
        updateQuery,
        updateComponents: (components) =>
          updateArray("components", setLocalComponents, components),
        updateUnits: (units) => updateRange("units", setLocalUnits, units),
        updateLevels: (levels) => updateArray("levels", setLocalLevels, levels),
        updateDays: (days) => updateArray("days", setLocalDays, days),
        updateBreadths: (breadths) =>
          updateArray("breadths", setLocalBreadths, breadths),
        updateUniversityRequirement,
        updateSortBy,
        updateOpen: (open) => updateBoolean("open", setLocalOpen, open),
        updateOnline: (online) =>
          updateBoolean("online", setLocalOnline, online),
        setExpanded,
        loading,
        updateReverse: setLocalReverse,
        totalCount,
        isFiltersChanged,
        loadedCount: classes.length,
        isBackgroundLoading,
      }}
    >
      <div
        className={classNames(styles.root, {
          [styles.responsive]: responsive,
          [styles.expanded]: expanded,
        })}
      >
        <Filters />
        <List onSelect={onSelect} />
      </div>
    </BrowserContext>
  );
}
