import { useMemo, useState } from "react";

import { useQuery } from "@apollo/client";
import classNames from "classnames";
import { useSearchParams } from "react-router-dom";

import useWindowDimensions from "@/hooks/useWindowDimensions";
import {
  Component,
  GET_CLASSES,
  GetClassesResponse,
  IClass,
  Semester,
} from "@/lib/api";

import styles from "./Browser.module.scss";
import Filters from "./Filters";
import List from "./List";
import {
  Day,
  Level,
  SortBy,
  Unit,
  getFilteredClasses,
  initialize,
} from "./browser";

interface BrowserProps {
  onSelect: (_class: IClass) => void;
  responsive?: boolean;
  semester: Semester;
  year: number;
  persistent?: boolean;
}

export default function Browser({
  onSelect,
  responsive = true,
  semester: currentSemester,
  year: currentYear,
  persistent,
}: BrowserProps) {
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const { width } = useWindowDimensions();

  const [localQuery, setLocalQuery] = useState<string>("");
  const [localComponents, setLocalComponents] = useState<Component[]>([]);
  const [localUnits, setLocalUnits] = useState<Unit[]>([]);
  const [localLevels, setLocalLevels] = useState<Level[]>([]);
  const [localDays, setLocalDays] = useState<Day[]>([]);
  const [localSortBy, setLocalSortBy] = useState<SortBy>(SortBy.Relevance);
  const [localOpen, setLocalOpen] = useState<boolean>(false);
  const [localOnline, setLocalOnline] = useState<boolean>(false);

  const block = useMemo(() => width <= 992, [width]);

  const overlay = useMemo(
    () => (responsive && width <= 1400) || block,
    [width, responsive, block]
  );

  const { data, loading } = useQuery<GetClassesResponse>(GET_CLASSES, {
    variables: {
      term: {
        semester: currentSemester,
        year: currentYear,
      },
    },
  });

  const classes = useMemo(
    () =>
      data?.catalog.reduce((acc, course) => {
        const classes = course.classes.map(
          (_class) =>
            ({
              ..._class,
              course: {
                subject: course.subject,
                number: course.number,
                title: course.title,
                gradeAverage: course.gradeAverage,
                academicCareer: course.academicCareer,
              },
            }) as IClass
        );

        return [...acc, ...classes];
      }, [] as IClass[]) ?? [],
    [data?.catalog]
  );

  const currentQuery = useMemo(
    () => (persistent ? searchParams.get("query") ?? "" : localQuery),
    [searchParams, localQuery, persistent]
  );

  const currentComponents = useMemo(
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

  const currentUnits = useMemo(
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

  const currentLevels = useMemo(
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

  const currentDays = useMemo(
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

  const currentSortBy = useMemo(() => {
    if (persistent) {
      const parameter = searchParams.get("sortBy") as SortBy;

      return Object.values(SortBy).includes(parameter)
        ? parameter
        : SortBy.Relevance;
    }

    return localSortBy;
  }, [searchParams, localSortBy, persistent]);

  const currentOpen = useMemo(
    () => (persistent ? searchParams.has("open") : localOpen),
    [searchParams, localOpen, persistent]
  );

  const currentOnline = useMemo(
    () => (persistent ? searchParams.has("online") : localOnline),
    [searchParams, localOnline, persistent]
  );

  const { includedClasses, excludedClasses } = useMemo(
    () =>
      getFilteredClasses(
        classes,
        currentComponents,
        currentUnits,
        currentLevels,
        currentDays,
        currentOpen,
        currentOnline
      ),
    [
      classes,
      currentComponents,
      currentUnits,
      currentLevels,
      currentDays,
      currentOpen,
      currentOnline,
    ]
  );

  console.log(currentOpen);

  const index = useMemo(() => initialize(includedClasses), [includedClasses]);

  const currentClasses = useMemo(() => {
    let filteredClasses = currentQuery
      ? index
          // Limit query because Fuse performance decreases linearly by
          // n (field length) * m (pattern length) * l (maximum Levenshtein distance)
          .search(currentQuery.slice(0, 24))
          .map(({ refIndex }) => includedClasses[refIndex])
      : includedClasses;

    if (currentSortBy) {
      // Clone the courses to avoid sorting in-place
      filteredClasses = structuredClone(filteredClasses).sort((a, b) => {
        if (currentSortBy === SortBy.AverageGrade) {
          return b.course.gradeAverage === a.course.gradeAverage
            ? 0
            : b.course.gradeAverage === null
              ? -1
              : a.course.gradeAverage === null
                ? 1
                : b.course.gradeAverage - a.course.gradeAverage;
        }

        if (currentSortBy === SortBy.Units) {
          return b.unitsMax - a.unitsMax;
        }

        if (currentSortBy === SortBy.OpenSeats) {
          const getOpenSeats = ({
            primarySection: { enrollCount, enrollMax },
          }: IClass) => enrollMax - enrollCount;

          return getOpenSeats(b) - getOpenSeats(a);
        }

        if (currentSortBy === SortBy.PercentOpenSeats) {
          const getPercentOpenSeats = ({
            primarySection: { enrollCount, enrollMax },
          }: IClass) =>
            enrollMax === 0 ? 0 : (enrollMax - enrollCount) / enrollMax;

          return getPercentOpenSeats(b) - getPercentOpenSeats(a);
        }

        // Classes are by default sorted by relevance and number
        return 0;
      });
    }

    return filteredClasses;
  }, [currentQuery, index, includedClasses, currentSortBy]);

  return (
    <div className={classNames(styles.root, { [styles.block]: block })}>
      {(open || !overlay) && (
        <Filters
          overlay={overlay}
          block={block}
          open={open}
          onOpenChange={setOpen}
          persistent={persistent}
          // Manage courses
          currentSortBy={currentSortBy}
          currentClasses={currentClasses}
          includedClasses={includedClasses}
          excludedClasses={excludedClasses}
          // Current term
          currentYear={currentYear}
          currentSemester={currentSemester}
          // Current filters
          currentQuery={currentQuery}
          currentComponents={currentComponents}
          currentUnits={currentUnits}
          currentLevels={currentLevels}
          currentDays={currentDays}
          currentOpen={currentOpen}
          currentOnline={currentOnline}
          // Update local filters
          setCurrentQuery={setLocalQuery}
          setCurrentUnits={setLocalUnits}
          setCurrentLevels={setLocalLevels}
          setCurrentDays={setLocalDays}
          setCurrentSortBy={setLocalSortBy}
          setCurrentComponents={setLocalComponents}
          setCurrentOpen={setLocalOpen}
          setCurrentOnline={setLocalOnline}
        />
      )}
      {(!open || !overlay) && (
        <List
          overlay={overlay}
          block={block}
          open={open}
          onOpenChange={setOpen}
          persistent={persistent}
          // API response
          loading={loading && !data?.catalog}
          // Manage courses
          onSelect={onSelect}
          currentClasses={currentClasses}
          // Current term
          currentYear={currentYear}
          currentSemester={currentSemester}
          // Current filters
          currentQuery={currentQuery}
          // Update local filters
          setCurrentQuery={setLocalQuery}
        />
      )}
    </div>
  );
}
