import { useEffect, useMemo, useState } from "react";

import classNames from "classnames";
import Fuse from "fuse.js";
import { useSearchParams } from "react-router-dom";

import useWindowDimensions from "@/hooks/useWindowDimensions";
import { ICatalogCourse, Semester } from "@/lib/api";
import { subjects } from "@/lib/course";

import styles from "./Browser.module.scss";
import Filters from "./Filters";
import List from "./List";

const initializeFuse = (courses: ICatalogCourse[]) => {
  const list = courses.map((course) => {
    const { title, subject, number, classes } = course;

    // For courses like W54, prefer the number and add an abbreviation
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
    findAllMatches: true,
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
    // Fuse types are wrong for sortFn
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
  onClick: (course: ICatalogCourse, number: string) => void;
  responsive?: boolean;
  currentSemester: Semester;
  currentYear: number;
}

export default function Browser({
  courses,
  onClick,
  responsive = true,
  currentSemester,
  currentYear,
}: BrowserProps) {
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [filteredCourses, setFilteredCourses] = useState<ICatalogCourse[]>([]);
  const [expandedCourses, setExpandedCourses] = useState<boolean[]>([]);
  const { width } = useWindowDimensions();

  const fuse = useMemo(() => initializeFuse(courses), [courses]);

  const currentQuery = useMemo(
    () => searchParams.get("query") ?? "",
    [searchParams]
  );

  const setExpanded = (index: number, expanded: boolean) => {
    setExpandedCourses((expandedCourses) => {
      const _expandedCourses = structuredClone(expandedCourses);
      _expandedCourses[index] = expanded;
      return _expandedCourses;
    });
  };

  useEffect(() => {
    const _filteredCourses = currentQuery
      ? fuse.search(currentQuery).map(({ refIndex }) => courses[refIndex])
      : courses;

    setFilteredCourses(_filteredCourses);

    // Close courses when filtered courses change
    setExpandedCourses(new Array(_filteredCourses.length).fill(false));
  }, [currentQuery, fuse, courses]);

  const block = useMemo(() => width <= 992, [width]);

  const overlay = useMemo(
    () => responsive && width <= 1400,
    [width, responsive]
  );

  return (
    <div className={classNames(styles.root, { [styles.block]: block })}>
      {(open || !overlay) && <Filters overlay={overlay} block={block} />}
      <List
        currentCourses={filteredCourses}
        onClick={onClick}
        setOpen={setOpen}
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
