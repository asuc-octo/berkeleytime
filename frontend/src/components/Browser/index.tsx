import { useMemo, useState } from "react";

import { useQuery } from "@apollo/client";
import classNames from "classnames";
import Fuse from "fuse.js";
import { useSearchParams } from "react-router-dom";

import useWindowDimensions from "@/hooks/useWindowDimensions";
import {
  Component,
  GET_CLASSES,
  GetClassesResponse,
  IClass,
  Semester,
} from "@/lib/api";
import { subjects } from "@/lib/course";

import styles from "./Browser.module.scss";
import Filters from "./Filters";
import List from "./List";
import { Day, Level, SortBy, Unit, getFilteredClasses } from "./browser";

const initializeFuse = (classes: IClass[]) => {
  const list = classes.map((_class) => {
    const { title, subject, number } = _class.course;

    // For prefixed courses, prefer the number and add an abbreviation with the prefix
    const containsPrefix = /^[a-zA-Z].*/.test(number);
    const alternateNumber = number.slice(1);

    const term = subject.toLowerCase();

    const alternateNames = subjects[term]?.abbreviations.reduce(
      (acc, abbreviation) => {
        // Add alternate names for abbreviations
        const abbreviations = [
          `${abbreviation}${number}`,
          `${abbreviation} ${number}`,
        ];

        if (containsPrefix) {
          abbreviations.push(
            `${abbreviation}${alternateNumber}`,
            `${abbreviation} ${alternateNumber}`
          );
        }

        return [...acc, ...abbreviations];
      },
      // Add alternate names
      containsPrefix
        ? [
            `${subject}${number}`,
            `${subject} ${alternateNumber}`,
            `${subject}${alternateNumber}`,
          ]
        : [`${subject}${number}`]
    );

    return {
      title: _class.title ?? title,
      subject,
      number,
      name: `${subject} ${number}`,
      alternateNames,
    };
  });

  const options = {
    includeScore: true,
    ignoreLocation: true,
    threshold: 0.25,
    keys: [
      { name: "number", weight: 1.2 },
      "name",
      "title",
      {
        name: "alternateNames",
        weight: 2,
      },
      { name: "subject", weight: 1.5 },
    ],
    // TODO: Fuse types are wrong for sortFn
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sortFn: (a: any, b: any) => {
      // First, sort by score
      if (a.score - b.score) return a.score - b.score;

      // Otherwise, sort by number
      return a.item[0].v.toLowerCase().localeCompare(b.item[0].v.toLowerCase());
    },
  };

  return new Fuse(list, options);
};

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

  const { includedClasses, excludedClasses } = useMemo(
    () =>
      getFilteredClasses(
        classes,
        currentComponents,
        currentUnits,
        currentLevels,
        currentDays
      ),
    [classes, currentComponents, currentUnits, currentLevels, currentDays]
  );

  const fuse = useMemo(
    () => initializeFuse(includedClasses),
    [includedClasses]
  );

  const currentClasses = useMemo(() => {
    let filteredClasses = currentQuery
      ? fuse
          .search(currentQuery)
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
  }, [currentQuery, fuse, includedClasses, currentSortBy]);

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
          // Update local filters
          setCurrentQuery={setLocalQuery}
          setCurrentUnits={setLocalUnits}
          setCurrentLevels={setLocalLevels}
          setCurrentDays={setLocalDays}
          setCurrentSortBy={setLocalSortBy}
          setCurrentComponents={setLocalComponents}
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
