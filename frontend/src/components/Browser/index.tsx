import { useEffect, useMemo, useState } from "react";

import classNames from "classnames";
import Fuse from "fuse.js";
import { useSearchParams } from "react-router-dom";

import useWindowDimensions from "@/hooks/useWindowDimensions";
import { Component, ICourse, Semester } from "@/lib/api";
import { subjects } from "@/lib/course";

import styles from "./Browser.module.scss";
import Filters from "./Filters";
import List from "./List";
import { Level, SortBy, Unit, getFilteredCourses } from "./browser";

const initializeFuse = (courses: ICourse[]) => {
  const list = courses.map((course) => {
    const { title, subject, number, classes } = course;

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
      title,
      subject,
      number,
      name: `${subject} ${number}`,
      alternateNames,
      classes,
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
      "classes.title",
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
  courses: ICourse[];
  onClassSelect: (course: ICourse, number: string) => void;
  responsive?: boolean;
  currentSemester: Semester;
  currentYear: number;
}

export default function Browser({
  courses,
  onClassSelect,
  responsive = true,
  currentSemester,
  currentYear,
}: BrowserProps) {
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [currentCourses, setCurrentCourses] = useState<ICourse[]>([]);
  const [expandedCourses, setExpandedCourses] = useState<boolean[]>([]);
  const { width } = useWindowDimensions();

  // Layout
  const block = useMemo(() => width <= 992, [width]);

  const overlay = useMemo(
    () => (responsive && width <= 1400) || block,
    [width, responsive, block]
  );

  const filters = useMemo(() => open || !overlay, [open, overlay]);

  // Filtering
  const currentQuery = useMemo(
    () => searchParams.get("query") ?? "",
    [searchParams]
  );

  const currentComponents = useMemo(
    () =>
      (searchParams
        .get("components")
        ?.split(",")
        .filter((component) =>
          Object.values(Component).includes(component as Component)
        ) ?? []) as Component[],
    [searchParams]
  );

  const currentUnits = useMemo(
    () =>
      (searchParams
        .get("units")
        ?.split(",")
        .filter((unit) => Object.values(Unit).includes(unit as Unit)) ??
        []) as Unit[],
    [searchParams]
  );

  const currentLevels = useMemo(
    () =>
      (searchParams
        .get("levels")
        ?.split(",")
        .filter((level) => Object.values(Level).includes(level as Level)) ??
        []) as Level[],
    [searchParams]
  );

  const currentSortBy = useMemo(() => {
    const parameter = searchParams.get("sortBy");

    if (
      !Object.values(SortBy).includes(parameter as SortBy) ||
      parameter === SortBy.Relevance
    )
      return;

    return parameter as SortBy;
  }, [searchParams]);

  const { includedCourses, excludedCourses } = useMemo(
    () =>
      getFilteredCourses(
        courses,
        currentComponents,
        currentUnits,
        currentLevels
      ),
    [courses, currentComponents, currentUnits, currentLevels]
  );

  const fuse = useMemo(
    () => initializeFuse(includedCourses),
    [includedCourses]
  );

  const setExpanded = (index: number, expanded: boolean) => {
    setExpandedCourses((expandedCourses) => {
      const _expandedCourses = structuredClone(expandedCourses);
      _expandedCourses[index] = expanded;
      return _expandedCourses;
    });
  };

  useEffect(() => {
    let _currentCourses = currentQuery
      ? fuse
          .search(currentQuery)
          .map(({ refIndex }) => includedCourses[refIndex])
      : includedCourses;

    // Courses are by default sorted by relevance and number
    if (currentSortBy) {
      _currentCourses = _currentCourses.sort((a, b) => {
        if (currentSortBy === SortBy.AverageGrade) {
          return b.gradeAverage === a.gradeAverage
            ? 0
            : b.gradeAverage === null
              ? -1
              : a.gradeAverage === null
                ? 1
                : b.gradeAverage - a.gradeAverage;
        }

        if (currentSortBy === SortBy.Units) {
          const getUnits = (course: ICourse) =>
            course.classes.reduce(
              (acc, { unitsMax }) => Math.max(acc, unitsMax),
              0
            );

          return getUnits(b) - getUnits(a);
        }

        if (currentSortBy === SortBy.OpenSeats) {
          const getOpenSeats = (course: ICourse) =>
            course.classes.reduce(
              (acc, { primarySection: { enrollCount, enrollMax } }) =>
                acc + (enrollMax - enrollCount),
              0
            );

          return getOpenSeats(b) - getOpenSeats(a);
        }

        if (currentSortBy === SortBy.PercentOpenSeats) {
          const getPercentOpenSeats = (course: ICourse) => {
            const { enrollCount, enrollMax } = course.classes.reduce(
              (acc, { primarySection: { enrollCount, enrollMax } }) => ({
                enrollCount: acc.enrollCount + enrollCount,
                enrollMax: acc.enrollMax + enrollMax,
              }),
              { enrollCount: 0, enrollMax: 0 }
            );

            return enrollMax === 0 ? 0 : (enrollMax - enrollCount) / enrollMax;
          };

          return getPercentOpenSeats(b) - getPercentOpenSeats(a);
        }

        return 0;
      });
    }

    setCurrentCourses(_currentCourses);

    // Collapse courses when filtered courses change
    setExpandedCourses(new Array(_currentCourses.length).fill(false));
  }, [currentQuery, fuse, includedCourses, currentSortBy]);

  return (
    <div className={classNames(styles.root, { [styles.block]: block })}>
      {filters && (
        <Filters
          overlay={overlay}
          block={block}
          includedCourses={includedCourses}
          currentCourses={currentCourses}
          excludedCourses={excludedCourses}
          currentComponents={currentComponents}
          currentUnits={currentUnits}
          currentLevels={currentLevels}
          onOpenChange={setOpen}
          open={open}
          currentSemester={currentSemester}
          currentYear={currentYear}
          currentQuery={currentQuery}
          currentSortBy={currentSortBy}
        />
      )}
      <List
        currentCourses={currentCourses}
        onClassSelect={onClassSelect}
        onOpenChange={setOpen}
        currentSemester={currentSemester}
        expandedCourses={expandedCourses}
        setExpanded={setExpanded}
        currentQuery={currentQuery}
        currentYear={currentYear}
        open={open}
        overlay={overlay}
        block={block}
      />
    </div>
  );
}
