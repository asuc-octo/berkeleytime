import { useEffect, useMemo, useState } from "react";

import classNames from "classnames";
import Fuse from "fuse.js";
import { useSearchParams } from "react-router-dom";

import useWindowDimensions from "@/hooks/useWindowDimensions";
import { ICatalogCourse, Semester } from "@/lib/api";
import { subjects } from "@/lib/course";
import { kindAbbreviations } from "@/lib/section";

import styles from "./Browser.module.scss";
import Filters from "./Filters";
import List from "./List";
import { getFilteredCourses } from "./browser";

const initializeFuse = (courses: ICatalogCourse[]) => {
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
  courses: ICatalogCourse[];
  onClassSelect: (course: ICatalogCourse, number: string) => void;
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
  const [currentCourses, setCurrentCourses] = useState<ICatalogCourse[]>([]);
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

  const currentKinds = useMemo(() => {
    const parameter = searchParams.get("kinds");

    return (
      parameter?.split(",").filter((kind) => kindAbbreviations[kind]) ?? []
    );
  }, [searchParams]);

  const currentUnits = useMemo(() => {
    const parameter = searchParams.get("units");

    return (
      parameter
        ?.split(",")
        .filter((unit) => ["5+", "4", "3", "2", "1", "0"].includes(unit)) ?? []
    );
  }, [searchParams]);

  const currentLevels = useMemo(() => {
    const parameter = searchParams.get("levels");

    return (
      parameter
        ?.split(",")
        .filter((level) =>
          ["Lower Division", "Upper Division", "Graduate"].includes(level)
        ) ?? []
    );
  }, [searchParams]);

  const { includedCourses, excludedCourses } = useMemo(
    () =>
      getFilteredCourses(courses, currentKinds, currentUnits, currentLevels),
    [courses, currentKinds, currentUnits, currentLevels]
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
    const _currentCourses = currentQuery
      ? fuse
          .search(currentQuery)
          .map(({ refIndex }) => includedCourses[refIndex])
      : includedCourses;

    setCurrentCourses(_currentCourses);

    // Collapse courses when filtered courses change
    setExpandedCourses(new Array(_currentCourses.length).fill(false));
  }, [currentQuery, fuse, includedCourses]);

  console.log(
    courses.reduce(
      (acc, course) => acc.add(course.gradingBasis),
      new Set<string>()
    )
  );

  return (
    <div className={classNames(styles.root, { [styles.block]: block })}>
      {filters && (
        <Filters
          overlay={overlay}
          block={block}
          includedCourses={includedCourses}
          excludedCourses={excludedCourses}
          currentKinds={currentKinds}
          currentUnits={currentUnits}
          currentLevels={currentLevels}
          onOpenChange={setOpen}
          open={open}
          currentSemester={currentSemester}
          currentYear={currentYear}
          currentQuery={currentQuery}
        />
      )}
      <List
        includedCourses={currentCourses}
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
