import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import { useSearchParams } from "react-router-dom";

import type { ICatalogFilters } from "@/lib/api/catalog";
import type { GetCatalogServerQueryVariables } from "@/lib/generated/graphql";

import {
  Day,
  EnrollmentFilter,
  GradingFilter,
  Level,
  SortBy,
  TimeRange,
  UnitRange,
} from "../browser";

type CatalogSortBy = GetCatalogServerQueryVariables["sortBy"];
type CatalogEnrollmentFilter = NonNullable<ICatalogFilters>["enrollmentFilter"];

const DEFAULT_SORT_ORDER: Record<SortBy, "asc" | "desc"> = {
  [SortBy.Relevance]: "asc",
  [SortBy.Units]: "asc",
  [SortBy.AverageGrade]: "desc",
  [SortBy.OpenSeats]: "desc",
};

const getEffectiveOrder = (
  sortBy: SortBy,
  reverse: boolean
): "asc" | "desc" => {
  const defaultOrder = DEFAULT_SORT_ORDER[sortBy] ?? "asc";
  if (!reverse) return defaultOrder;
  return defaultOrder === "asc" ? "desc" : "asc";
};

// Map frontend GradingFilter to grading basis codes
export const mapGradingFilterToBasisCodes = (
  filters: GradingFilter[]
): string[] => {
  const codes: string[] = [];
  for (const filter of filters) {
    switch (filter) {
      case GradingFilter.Graded:
        codes.push("OPT", "GRD");
        break;
      case GradingFilter.PassNoPass:
        codes.push("PNP");
        break;
      case GradingFilter.Other:
        codes.push("ESU", "SUS", "BMT", "IOP", "CNC", "LAW", "LW1");
        break;
    }
  }
  return codes;
};

// Map frontend EnrollmentFilter to GraphQL enum
export const mapEnrollmentFilter = (
  filter: EnrollmentFilter | null
): CatalogEnrollmentFilter | undefined => {
  if (!filter) return undefined;
  switch (filter) {
    case EnrollmentFilter.Open:
      return "OPEN" as CatalogEnrollmentFilter;
    case EnrollmentFilter.OpenApartFromReserved:
      return "NON_RESERVED_OPEN" as CatalogEnrollmentFilter;
    case EnrollmentFilter.WaitlistOpen:
      return "WAITLIST_OPEN" as CatalogEnrollmentFilter;
    default:
      return undefined;
  }
};

// Map frontend Day indices to data day indices
const mapDayIndices = (days: Day[]): number[] => {
  return days.map((day) => (parseInt(day) - 1 + 7) % 7);
};

// Map frontend SortBy to GraphQL CatalogSortBy enum
export const mapSortBy = (sortBy: SortBy): CatalogSortBy => {
  switch (sortBy) {
    case SortBy.Units:
      return "UNITS" as CatalogSortBy;
    case SortBy.AverageGrade:
      return "AVERAGE_GRADE" as CatalogSortBy;
    case SortBy.OpenSeats:
      return "OPEN_SEATS" as CatalogSortBy;
    case SortBy.Relevance:
    default:
      return "RELEVANCE" as CatalogSortBy;
  }
};

export interface UseCatalogFiltersOptions {
  persistent?: boolean;
}

export interface CatalogFilterState {
  query: string;
  units: UnitRange;
  levels: Level[];
  days: Day[];
  timeRange: TimeRange;
  breadths: string[];
  universityRequirements: string[];
  gradingFilters: GradingFilter[];
  academicOrganization: string | null;
  sortBy: SortBy;
  reverse: boolean;
  effectiveOrder: "asc" | "desc";
  enrollmentFilter: EnrollmentFilter | null;
  online: boolean;
  hasActiveFilters: boolean;
  filterVariables: ICatalogFilters | undefined;
}

export interface CatalogFilterUpdaters {
  updateQuery: Dispatch<string>;
  updateUnits: Dispatch<UnitRange>;
  updateLevels: Dispatch<Level[]>;
  updateDays: Dispatch<Day[]>;
  updateTimeRange: Dispatch<TimeRange>;
  updateBreadths: Dispatch<string[]>;
  updateUniversityRequirements: Dispatch<string[]>;
  updateGradingFilters: Dispatch<GradingFilter[]>;
  updateAcademicOrganization: Dispatch<string | null>;
  updateSortBy: Dispatch<SortBy>;
  updateEnrollmentFilter: Dispatch<EnrollmentFilter | null>;
  updateOnline: Dispatch<boolean>;
  updateReverse: Dispatch<SetStateAction<boolean>>;
}

export type UseCatalogFiltersReturn = CatalogFilterState &
  CatalogFilterUpdaters;

export default function useCatalogFilters({
  persistent = false,
}: UseCatalogFiltersOptions = {}): UseCatalogFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  const [localQuery, setLocalQuery] = useState<string>(() =>
    persistent ? (searchParams.get("query") ?? "") : ""
  );
  const [localUnits, setLocalUnits] = useState<UnitRange>([0, 5]);
  const [localLevels, setLocalLevels] = useState<Level[]>([]);
  const [localDays, setLocalDays] = useState<Day[]>([]);
  const [localTimeRange, setLocalTimeRange] = useState<TimeRange>([null, null]);
  const [localBreadths, setLocalBreadths] = useState<string[]>([]);
  const [localUniversityRequirements, setLocalUniversityRequirements] =
    useState<string[]>([]);
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

  // Derive state from search params when persistent
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
        ? (searchParams.get("breadths")?.split(",").filter(Boolean) ?? [])
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
    return persistent
      ? (searchParams.get("academicOrganization") ?? null)
      : localAcademicOrganization;
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

  // Reset reverse when sortBy changes (derived state during render, not effect)
  const prevSortByRef = useRef(sortBy);
  if (prevSortByRef.current !== sortBy) {
    prevSortByRef.current = sortBy;
    setLocalReverse(false);
  }

  const effectiveOrder = useMemo(
    () => getEffectiveOrder(sortBy, localReverse),
    [sortBy, localReverse]
  );

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

  // Build server-side filter variables
  const filterVariables = useMemo<ICatalogFilters | undefined>(() => {
    const filters: NonNullable<ICatalogFilters> = {};

    if (levels.length > 0) filters.levels = levels;
    if (academicOrganization) filters.departments = [academicOrganization];

    if (units[0] !== 0 || units[1] !== 5) {
      filters.unitsMin = units[0];
      filters.unitsMax = units[1] === 5 ? 99 : units[1];
    }

    if (days.length > 0) filters.days = mapDayIndices(days);
    if (timeRange[0]) filters.timeFrom = timeRange[0];
    if (timeRange[1]) filters.timeTo = timeRange[1];

    const mappedEnrollment = mapEnrollmentFilter(enrollmentFilter);
    if (mappedEnrollment) filters.enrollmentFilter = mappedEnrollment;

    if (gradingFilters.length > 0) {
      filters.gradingFilters = mapGradingFilterToBasisCodes(gradingFilters);
    }

    if (breadths.length > 0) filters.breadths = breadths;
    if (universityRequirements.length > 0) {
      filters.universityRequirements = universityRequirements;
    }

    if (online) filters.online = true;

    return Object.keys(filters).length > 0 ? filters : undefined;
  }, [
    levels,
    academicOrganization,
    units,
    days,
    timeRange,
    enrollmentFilter,
    gradingFilters,
    breadths,
    universityRequirements,
    online,
  ]);

  const hasActiveFilters =
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
    sortBy !== SortBy.Relevance;

  // URL sync updater helpers
  const updateArray = <T>(
    key: string,
    setState: (state: T[]) => void,
    state: T[]
  ) => {
    if (persistent) {
      if (state.length > 0) {
        searchParams.set(key, state.join(","));
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

  const updateTimeRangeFn = useCallback(
    (value: TimeRange) => {
      if (persistent) {
        if (value[0]) searchParams.set("timeFrom", value[0]);
        else searchParams.delete("timeFrom");
        if (value[1]) searchParams.set("timeTo", value[1]);
        else searchParams.delete("timeTo");
        setSearchParams(searchParams);
        return;
      }
      setLocalTimeRange(value);
    },
    [persistent, searchParams, setSearchParams]
  );

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

  const updateQuery = (q: string) => {
    setLocalQuery(q);
  };

  return {
    // State
    query,
    units,
    levels,
    days,
    timeRange,
    breadths,
    universityRequirements,
    gradingFilters,
    academicOrganization,
    sortBy,
    reverse: localReverse,
    effectiveOrder,
    enrollmentFilter,
    online,
    hasActiveFilters,
    filterVariables,
    // Updaters
    updateQuery,
    updateUnits: (u) => updateRange("units", setLocalUnits, u),
    updateLevels: (l) => updateArray("levels", setLocalLevels, l),
    updateDays: (d) => updateArray("days", setLocalDays, d),
    updateTimeRange: updateTimeRangeFn,
    updateBreadths: (b) => updateArray("breadths", setLocalBreadths, b),
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
        if (org) searchParams.set("academicOrganization", org);
        else searchParams.delete("academicOrganization");
        setSearchParams(searchParams);
        return;
      }
      setLocalAcademicOrganization(org);
    },
    updateSortBy,
    updateEnrollmentFilter: (filter) => {
      if (persistent) {
        if (filter === null) searchParams.delete("enrollmentFilter");
        else searchParams.set("enrollmentFilter", filter);
        setSearchParams(searchParams);
        return;
      }
      setLocalEnrollmentFilter(filter);
    },
    updateOnline: (o) => updateBoolean("online", setLocalOnline, o),
    updateReverse: setLocalReverse,
  };
}
