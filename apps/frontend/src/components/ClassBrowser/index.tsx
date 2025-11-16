import { useEffect, useMemo, useState } from "react";

import { useQuery } from "@apollo/client/react";
import classNames from "classnames";
import { useSearchParams } from "react-router-dom";

import { ITerm } from "@/lib/api";
import { GetCanonicalCatalogDocument, Semester } from "@/lib/generated/graphql";

import styles from "./ClassBrowser.module.scss";
import Filters from "./Filters";
import List from "./List";
import {
  Breadth,
  Day,
  GradingFilter,
  Level,
  SortBy,
  UnitRange,
  UniversityRequirement,
  getFilteredClasses,
  getIndex,
} from "./browser";
import BrowserContext from "./browserContext";
import { searchAndSortClasses } from "./searchAndSort";

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
  const [localUnits, setLocalUnits] = useState<UnitRange>([0, 5]);
  const [localLevels, setLocalLevels] = useState<Level[]>([]);
  const [localDays, setLocalDays] = useState<Day[]>([]);
  const [localBreadths, setLocalBreadths] = useState<Breadth[]>([]);
  const [localUniversityRequirement, setLocalUniversityRequirement] =
    useState<UniversityRequirement | null>(null);
  const [localGradingFilters, setLocalGradingFilters] = useState<
    GradingFilter[]
  >([]);
  const [localDepartment, setLocalDepartment] = useState<string | null>(null);
  const [localSortBy, setLocalSortBy] = useState<SortBy>(SortBy.Relevance);
  const [localReverse, setLocalReverse] = useState<boolean>(false);
  const [localOpen, setLocalOpen] = useState<boolean>(false);
  const [localOnline, setLocalOnline] = useState<boolean>(false);
  const [aiSearchActive, setAiSearchActive] = useState<boolean>(false);
  const [semanticResults, setSemanticResults] = useState<
    Array<{ subject: string; courseNumber: string }>
  >([]);
  const [semanticLoading, setSemanticLoading] = useState(false);

  const { data, loading } = useQuery(GetCanonicalCatalogDocument, {
    variables: {
      semester: currentSemester,
      year: currentYear,
    },
    fetchPolicy: "no-cache",
    nextFetchPolicy: "no-cache",
  });

  const classes = useMemo(() => data?.catalog ?? [], [data]);

  const query = localQuery;

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

  const gradingFilters = useMemo(
    () =>
      persistent
        ? ((searchParams
            .get("gradingBases")
            ?.split(",")
            .filter((basis) =>
              Object.values(GradingFilter).includes(basis as GradingFilter)
            ) ?? []) as GradingFilter[])
        : localGradingFilters,
    [searchParams, localGradingFilters, persistent]
  );

  const department = useMemo(() => {
    const value = persistent
      ? (searchParams.get("department") ?? null)
      : localDepartment;

    return value ? value.toLowerCase() : null;
  }, [searchParams, localDepartment, persistent]);

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

  const { includedClasses, excludedClasses } = useMemo(
    () =>
      getFilteredClasses(
        classes,
        units,
        levels,
        days,
        open,
        online,
        breadths,
        universityRequirement,
        gradingFilters,
        department
      ),
    [
      classes,
      units,
      levels,
      days,
      open,
      online,
      breadths,
      universityRequirement,
      gradingFilters,
      department,
    ]
  );

  const index = useMemo(() => getIndex(includedClasses), [includedClasses]);

  const filteredClasses = useMemo(() => {
    // If AI search is active and we have semantic results, filter by those
    if (aiSearchActive && semanticResults.length > 0) {
      const semanticMap = new Set(
        semanticResults.map((r) => `${r.subject}-${r.courseNumber}`)
      );

      const filtered = includedClasses.filter((cls) =>
        semanticMap.has(`${cls.subject}-${cls.courseNumber}`)
      );

      return filtered;
    }

    // Otherwise use normal fuzzy search
    const result = searchAndSortClasses({
      classes: includedClasses,
      index,
      query,
      sortBy,
      order: effectiveOrder,
    });

    return result;
  }, [
    aiSearchActive,
    semanticResults,
    includedClasses,
    index,
    query,
    sortBy,
    effectiveOrder,
  ]);

  const hasActiveFilters = useMemo(() => {
    return (
      units[0] !== 0 ||
      units[1] !== 5 ||
      levels.length > 0 ||
      days.length > 0 ||
      breadths.length > 0 ||
      universityRequirement !== null ||
      gradingFilters.length > 0 ||
      department !== null ||
      open ||
      online ||
      sortBy !== SortBy.Relevance
    );
  }, [
    units,
    levels,
    days,
    breadths,
    universityRequirement,
    gradingFilters,
    department,
    open,
    online,
    sortBy,
  ]);

  // Semantic search handler
  const handleSemanticSearch = async () => {
    if (!query.trim()) {
      setSemanticResults([]);
      return;
    }

    setSemanticLoading(true);
    try {
      const params = new URLSearchParams({
        query: query.trim(),
        year: String(currentYear),
        semester: currentSemester,
        top_k: "50",
      });

      const response = await fetch(`/api/semantic-search/courses?${params}`);

      if (!response.ok) {
        throw new Error("Semantic search failed");
      }

      const data = await response.json();
      setSemanticResults(data.results || []);
    } catch (error) {
      console.error("Semantic search error:", error);
      setSemanticResults([]);
    } finally {
      setSemanticLoading(false);
    }
  };

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
        hasActiveFilters,
        query,
        units,
        levels,
        days,
        breadths,
        universityRequirement,
        gradingFilters,
        department,
        online,
        open,
        reverse: localReverse,
        effectiveOrder,
        aiSearchActive,
        updateQuery,
        updateUnits: (units) => updateRange("units", setLocalUnits, units),
        updateLevels: (levels) => updateArray("levels", setLocalLevels, levels),
        updateDays: (days) => updateArray("days", setLocalDays, days),
        updateBreadths: (breadths) =>
          updateArray("breadths", setLocalBreadths, breadths),
        updateUniversityRequirement,
        updateGradingFilters: (filters) =>
          updateArray("gradingBases", setLocalGradingFilters, filters),
        updateDepartment: (dept) => {
          if (persistent) {
            const normalized = dept ? dept.toLowerCase() : null;
            if (normalized) {
              searchParams.set("department", normalized);
            } else {
              searchParams.delete("department");
            }
            setSearchParams(searchParams);
            return;
          }

          setLocalDepartment(dept ? dept.toLowerCase() : null);
        },
        updateSortBy,
        updateOpen: (open) => updateBoolean("open", setLocalOpen, open),
        updateOnline: (online) =>
          updateBoolean("online", setLocalOnline, online),
        setExpanded,
        loading,
        updateReverse: setLocalReverse,
        setAiSearchActive,
        handleSemanticSearch,
        semanticLoading,
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
