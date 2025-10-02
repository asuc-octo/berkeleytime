import { useMemo, useState } from "react";

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

  const [localQuery, setLocalQuery] = useState<string>(() =>
    persistent ? (searchParams.get("query") ?? "") : ""
  );
  const [localComponents, setLocalComponents] = useState<Component[]>([]);
  const [localUnits, setLocalUnits] = useState<Unit[]>([]);
  const [localLevels, setLocalLevels] = useState<Level[]>([]);
  const [localDays, setLocalDays] = useState<Day[]>([]);
  const [localSortBy, setLocalSortBy] = useState<SortBy>(SortBy.Relevance);
  const [localOpen, setLocalOpen] = useState<boolean>(false);
  const [localOnline, setLocalOnline] = useState<boolean>(false);

  const { data, loading } = useQuery<GetCatalogResponse>(GET_CATALOG, {
    variables: {
      semester: currentSemester,
      year: currentYear,
    },
  });

  const classes = useMemo(() => data?.catalog ?? [], [data]);

  const query = localQuery;

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
        : SortBy.Relevance;
    }

    return localSortBy;
  }, [searchParams, localSortBy, persistent]);

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

    if (sortBy) {
      // Clone the courses to avoid sorting in-place
      filteredClasses = structuredClone(filteredClasses).sort((a, b) => {
        if (sortBy === SortBy.AverageGrade) {
          return b.course.gradeDistribution.average ===
            a.course.gradeDistribution.average
            ? 0
            : b.course.gradeDistribution.average === null
              ? -1
              : a.course.gradeDistribution.average === null
                ? 1
                : b.course.gradeDistribution.average -
                  a.course.gradeDistribution.average;
        }

        if (sortBy === SortBy.Units) {
          return b.unitsMax - a.unitsMax;
        }

        if (sortBy === SortBy.OpenSeats) {
          const getOpenSeats = ({ primarySection: { enrollment } }: IClass) =>
            enrollment
              ? enrollment.latest.maxEnroll - enrollment.latest.enrolledCount
              : 0;

          return getOpenSeats(b) - getOpenSeats(a);
        }

        if (sortBy === SortBy.PercentOpenSeats) {
          const getPercentOpenSeats = ({
            primarySection: { enrollment },
          }: IClass) =>
            enrollment?.latest.maxEnroll
              ? (enrollment.latest.maxEnroll -
                  enrollment.latest.enrolledCount) /
                enrollment.latest.maxEnroll
              : 0;

          return getPercentOpenSeats(b) - getPercentOpenSeats(a);
        }

        // Classes are by default sorted by relevance and number
        return 0;
      });
    }

    return filteredClasses;
  }, [query, index, includedClasses, sortBy]);

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
        query,
        components,
        units,
        levels,
        days,
        online,
        open,
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
