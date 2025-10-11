import { useEffect, useMemo, useState } from "react";

import { useQuery } from "@apollo/client/react";
import classNames from "classnames";
import { useSearchParams } from "react-router-dom";

import {
  Component,
  GET_CATALOG,
  GetCatalogResponse,
  IClass,
  Semester,
} from "@/lib/api";

import styles from "./ClassBrowser.module.scss";
import Filters from "./Filters";
import List from "./List";
import {
  Day,
  Level,
  SortBy,
  Unit,
  getFilteredClasses,
  getIndex,
} from "./browser";
import BrowserContext from "./browserContext";

const DEFAULT_SORT_ORDER: Record<SortBy, "asc" | "desc"> = {
  [SortBy.Alphabetical]: "asc",
  [SortBy.Units]: "asc",
  [SortBy.AverageGrade]: "desc",
  [SortBy.OpenSeats]: "desc",
  [SortBy.PercentOpenSeats]: "desc",
};

const getEffectiveOrder = (sortBy: SortBy, reverse: boolean): "asc" | "desc" => {
  const defaultOrder = DEFAULT_SORT_ORDER[sortBy] ?? "asc";

  if (!reverse) return defaultOrder;

  return defaultOrder === "asc" ? "desc" : "asc";
};

interface ClassBrowserProps {
  onSelect: (subject: string, courseNumber: string, number: string) => void;
  responsive?: boolean;
  semester: Semester;
  year: number;
  persistent?: boolean;
}

export default function ClassBrowser({
  onSelect,
  responsive = true,
  semester: currentSemester,
  year: currentYear,
  persistent,
}: ClassBrowserProps) {
  const [expanded, setExpanded] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [localQuery, setLocalQuery] = useState<string>("");
  const [localComponents, setLocalComponents] = useState<Component[]>([]);
  const [localUnits, setLocalUnits] = useState<Unit[]>([]);
  const [localLevels, setLocalLevels] = useState<Level[]>([]);
  const [localDays, setLocalDays] = useState<Day[]>([]);
  const [localSortBy, setLocalSortBy] = useState<SortBy>(SortBy.Alphabetical);
  const [localReverse, setLocalReverse] = useState<boolean>(false);
  const [localOpen, setLocalOpen] = useState<boolean>(false);
  const [localOnline, setLocalOnline] = useState<boolean>(false);

  const { data, loading } = useQuery<GetCatalogResponse>(GET_CATALOG, {
    variables: {
      semester: currentSemester,
      year: currentYear,
    },
  });

  const classes = useMemo(() => data?.catalog ?? [], [data]);

  const query = useMemo(
    () => (persistent ? (searchParams.get("query") ?? "") : localQuery),
    [searchParams, localQuery, persistent]
  );

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

  const units = useMemo(
    () =>
      persistent
        ? ((searchParams
            .get("units")
            ?.split(",")
            .filter((unit) => Object.values(Unit).includes(unit as Unit)) ??
            []) as Unit[])
        : localUnits,
    [searchParams, localUnits, persistent]
  );

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

  const sortBy = useMemo(() => {
    if (persistent) {
      const parameter = searchParams.get("sortBy") as SortBy;

      return Object.values(SortBy).includes(parameter)
        ? parameter
        : SortBy.Alphabetical;
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
        components,
        units,
        levels,
        days,
        open,
        online
      ),
    [classes, components, units, levels, days, open, online]
  );

  const index = useMemo(() => getIndex(includedClasses), [includedClasses]);

  const filteredClasses = useMemo(() => {
    let filteredClasses = query
      ? index
          // Limit query because Fuse performance decreases linearly by
          // n (field length) * m (pattern length) * l (maximum Levenshtein distance)
          .search(query.slice(0, 24))
          .map(({ refIndex }) => includedClasses[refIndex])
      : includedClasses;

    const compareClasses = (a: IClass, b: IClass) => {
      const multiplier = effectiveOrder === "asc" ? 1 : -1;

      if (sortBy === SortBy.AverageGrade) {
        const aAvg = a.course.gradeDistribution.average;
        const bAvg = b.course.gradeDistribution.average;

        const aHasAverage = typeof aAvg === "number";
        const bHasAverage = typeof bAvg === "number";

        if (aHasAverage !== bHasAverage) {
          return aHasAverage ? -1 : 1;
        }

        if (!aHasAverage || !bHasAverage) {
          return 0;
        }

        return (aAvg - bAvg) * multiplier;
      }

      if (sortBy === SortBy.Units) {
        const normalize = (value: number) =>
          Math.round((value ?? 0) * 100) / 100;

        const aMin = normalize(a.unitsMin);
        const aMax = normalize(a.unitsMax);
        const bMin = normalize(b.unitsMin);
        const bMax = normalize(b.unitsMax);

        const isSingleUnit = (min: number, max: number) =>
          Math.abs(max - min) < 0.001;

        const aIsRange = !isSingleUnit(aMin, aMax);
        const bIsRange = !isSingleUnit(bMin, bMax);

        if (aIsRange !== bIsRange) {
          return aIsRange ? 1 : -1;
        }

        if (!aIsRange && !bIsRange) {
          if (aMax !== bMax) {
            return (aMax - bMax) * multiplier;
          }
        } else {
          if (aMin !== bMin) {
            return (aMin - bMin) * multiplier;
          }

          if (aMax !== bMax) {
            return (aMax - bMax) * multiplier;
          }
        }

        const subjectComparison = a.course.subject.localeCompare(
          b.course.subject
        );
        if (subjectComparison !== 0) return subjectComparison * multiplier;

        return a.course.number.localeCompare(b.course.number) * multiplier;
      }

      if (sortBy === SortBy.Alphabetical) {
        return (
          a.course.subject.localeCompare(b.course.subject) * multiplier ||
          a.course.number.localeCompare(b.course.number) * multiplier
        );
      }

      if (sortBy === SortBy.OpenSeats) {
        const getOpenSeats = ({ primarySection: { enrollment } }: IClass) =>
          enrollment
            ? enrollment.latest.maxEnroll - enrollment.latest.enrolledCount
            : 0;

        return (getOpenSeats(a) - getOpenSeats(b)) * multiplier;
      }

      if (sortBy === SortBy.PercentOpenSeats) {
        const getPercentOpenSeats = ({
          primarySection: { enrollment },
        }: IClass) =>
          enrollment?.latest.maxEnroll
            ? (enrollment.latest.maxEnroll - enrollment.latest.enrolledCount) /
              enrollment.latest.maxEnroll
            : 0;

        return (
          getPercentOpenSeats(a) - getPercentOpenSeats(b)
        ) * multiplier;
      }

      // Classes default to alphabetical ordering when no other sort is selected
      return 0;
    };

    if (sortBy) {
      filteredClasses = structuredClone(filteredClasses).sort(compareClasses);
    }

    return filteredClasses;
  }, [query, index, includedClasses, sortBy, localReverse, effectiveOrder]);

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

  const updateSortBy = (value: SortBy) => {
    setLocalReverse(false);
    if (persistent) {
      if (value === SortBy.Alphabetical) searchParams.delete("sortBy");
      else searchParams.set("sortBy", value);
      setSearchParams(searchParams);

      return;
    }

    setLocalSortBy(value);
  };

  const updateQuery = (query: string) => {
    if (persistent) {
      if (query) searchParams.set("query", query);
      else searchParams.delete("query");
      setSearchParams(searchParams, { replace: true });

      return;
    }

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
        query,
        components,
        units,
        levels,
        days,
        online,
        open,
        reverse: localReverse,
        effectiveOrder,
        updateQuery,
        updateComponents: (components) =>
          updateArray("components", setLocalComponents, components),
        updateUnits: (units) => updateArray("units", setLocalUnits, units),
        updateLevels: (levels) => updateArray("levels", setLocalLevels, levels),
        updateDays: (days) => updateArray("days", setLocalDays, days),
        updateSortBy,
        updateOpen: (open) => updateBoolean("open", setLocalOpen, open),
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
