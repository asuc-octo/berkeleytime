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
  EnrollmentFilter,
  GradingFilter,
  Level,
  SortBy,
  TimeRange,
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
  [SortBy.Views]: "desc",
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
  onSelect: (
    subject: string,
    courseNumber: string,
    number: string,
    sessionId: string
  ) => void;
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
  const [localTimeRange, setLocalTimeRange] = useState<TimeRange>([null, null]);
  const [localBreadths, setLocalBreadths] = useState<Breadth[]>([]);
  const [localUniversityRequirements, setLocalUniversityRequirements] =
    useState<UniversityRequirement[]>([]);
  const [localGradingFilters, setLocalGradingFilters] = useState<
    GradingFilter[]
  >([]);
  const [localAcademicOrganization, setLocalAcademicOrganization] = useState<
    string | null
  >(null);
  const [localSortBy, setLocalSortBy] = useState<SortBy>(SortBy.Relevance);
  const [localReverse, setLocalReverse] = useState<boolean>(false);
  const [localEnrollmentFilter, setLocalEnrollmentFilter] =
    useState<EnrollmentFilter | null>(null);
  const [localOnline, setLocalOnline] = useState<boolean>(false);

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

  const timeRange = useMemo((): TimeRange => {
    if (!persistent) return localTimeRange;

    const timeFrom = searchParams.get("timeFrom");
    const timeTo = searchParams.get("timeTo");
    return [timeFrom, timeTo];
  }, [searchParams, localTimeRange, persistent]);

  const breadths = useMemo(
    () =>
      persistent
        ? (searchParams.get("breadths")?.split(",") ?? [])
        : localBreadths,
    [searchParams, localBreadths, persistent]
  );

  const universityRequirements = useMemo(
    () =>
      persistent
        ? (searchParams
            .get("universityRequirements")
            ?.split(",")
            .filter(Boolean) ?? [])
        : localUniversityRequirements,
    [searchParams, localUniversityRequirements, persistent]
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

  const academicOrganization = useMemo(() => {
    const value = persistent
      ? (searchParams.get("academicOrganization") ?? null)
      : localAcademicOrganization;

    return value;
  }, [searchParams, localAcademicOrganization, persistent]);

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

  const enrollmentFilter = useMemo(() => {
    if (persistent) {
      const param = searchParams.get("enrollmentFilter");
      if (
        param &&
        Object.values(EnrollmentFilter).includes(param as EnrollmentFilter)
      ) {
        return param as EnrollmentFilter;
      }
      return null;
    }
    return localEnrollmentFilter;
  }, [searchParams, localEnrollmentFilter, persistent]);

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
        enrollmentFilter,
        online,
        breadths,
        universityRequirements,
        gradingFilters,
        academicOrganization,
        timeRange
      ),
    [
      classes,
      units,
      levels,
      days,
      enrollmentFilter,
      online,
      breadths,
      universityRequirements,
      gradingFilters,
      academicOrganization,
      timeRange,
    ]
  );

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

  const hasActiveFilters = useMemo(() => {
    return (
      units[0] !== 0 ||
      units[1] !== 5 ||
      levels.length > 0 ||
      days.length > 0 ||
      timeRange[0] !== null ||
      timeRange[1] !== null ||
      breadths.length > 0 ||
      universityRequirements.length > 0 ||
      gradingFilters.length > 0 ||
      academicOrganization !== null ||
      enrollmentFilter !== null ||
      online ||
      sortBy !== SortBy.Relevance
    );
  }, [
    units,
    levels,
    days,
    timeRange,
    breadths,
    universityRequirements,
    gradingFilters,
    academicOrganization,
    enrollmentFilter,
    online,
    sortBy,
  ]);

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

  const updateTimeRange = (value: TimeRange) => {
    if (persistent) {
      if (value[0]) {
        searchParams.set("timeFrom", value[0]);
      } else {
        searchParams.delete("timeFrom");
      }
      if (value[1]) {
        searchParams.set("timeTo", value[1]);
      } else {
        searchParams.delete("timeTo");
      }
      setSearchParams(searchParams);
      return;
    }

    setLocalTimeRange(value);
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
        timeRange,
        breadths,
        universityRequirements,
        gradingFilters,
        academicOrganization,
        online,
        enrollmentFilter,
        reverse: localReverse,
        effectiveOrder,
        updateQuery,
        updateUnits: (units) => updateRange("units", setLocalUnits, units),
        updateLevels: (levels) => updateArray("levels", setLocalLevels, levels),
        updateDays: (days) => updateArray("days", setLocalDays, days),
        updateTimeRange,
        updateBreadths: (breadths) =>
          updateArray("breadths", setLocalBreadths, breadths),
        updateUniversityRequirements: (reqs) =>
          updateArray(
            "universityRequirements",
            setLocalUniversityRequirements,
            reqs
          ),
        updateGradingFilters: (filters) =>
          updateArray("gradingBases", setLocalGradingFilters, filters),
        updateAcademicOrganization: (org) => {
          if (persistent) {
            if (org) {
              searchParams.set("academicOrganization", org);
            } else {
              searchParams.delete("academicOrganization");
            }
            setSearchParams(searchParams);
            return;
          }

          setLocalAcademicOrganization(org);
        },
        updateSortBy,
        updateEnrollmentFilter: (filter) => {
          if (persistent) {
            if (filter === null) {
              searchParams.delete("enrollmentFilter");
            } else {
              searchParams.set("enrollmentFilter", filter);
            }
            setSearchParams(searchParams);
            return;
          }
          setLocalEnrollmentFilter(filter);
        },
        updateOnline: (online) =>
          updateBoolean("online", setLocalOnline, online),
        setExpanded,
        loading,
        updateReverse: setLocalReverse,
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
