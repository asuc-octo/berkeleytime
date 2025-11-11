import { useMemo, useState } from "react";

import { useQuery } from "@apollo/client/react";
import classNames from "classnames";
import { useSearchParams } from "react-router-dom";

import useWindowDimensions from "@/hooks/useWindowDimensions";
import {
  GET_COURSES,
  GetCoursesResponse,
  ICourse,
  InstructionMethod,
  Semester,
} from "@/lib/api";

import styles from "./CourseBrowser.module.scss";
import Filters from "./Filters";
import List from "./List";
import { Level, SortBy, getFilteredCourses, initialize } from "./browser";
import { GetCoursesDocument } from "@/lib/generated/graphql";

interface CourseBrowserProps {
  onSelect: (course: ICourse) => void;
  responsive?: boolean;
  persistent?: boolean;
  defaultSemesters?: Semester[];
}

export default function CourseBrowser({
  onSelect,
  responsive = true,
  persistent,
  defaultSemesters,
}: CourseBrowserProps) {
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const { width } = useWindowDimensions();

  const [localQuery, setLocalQuery] = useState<string>("");
  const [localInstructionMethods, setLocalInstructionMethods] = useState<
    InstructionMethod[]
  >([]);
  const [localLevels, setLocalLevels] = useState<Level[]>([]);
  const [localSortBy, setLocalSortBy] = useState<SortBy>(SortBy.Relevance);
  const [localSemesters, setLocalSemesters] = useState<Semester[]>(
    defaultSemesters ?? []
  );

  const block = useMemo(() => width <= 992, [width]);

  const overlay = useMemo(
    () => (responsive && width <= 1400) || block,
    [width, responsive, block]
  );

  const { data, loading } = useQuery(GetCoursesDocument);

  const courses = useMemo(() => data?.courses ?? [], [data?.courses]);

  const currentQuery = useMemo(
    () => (persistent ? (searchParams.get("query") ?? "") : localQuery),
    [searchParams, localQuery, persistent]
  );

  const currentInstructionMethods = useMemo(
    () =>
      persistent
        ? ((searchParams
            .get("instruction-methods")
            ?.split(",")
            .filter((instructionMethod) =>
              Object.values(InstructionMethod).includes(
                instructionMethod as InstructionMethod
              )
            ) ?? []) as InstructionMethod[])
        : localInstructionMethods,
    [searchParams, localInstructionMethods, persistent]
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

  const currentSortBy = useMemo(() => {
    if (persistent) {
      const parameter = searchParams.get("sortBy") as SortBy;

      return Object.values(SortBy).includes(parameter)
        ? parameter
        : SortBy.Relevance;
    }

    return localSortBy;
  }, [searchParams, localSortBy, persistent]);

  const currentSemesters = useMemo(
    () =>
      persistent
        ? ((searchParams
            .get("semesters")
            ?.split(",")
            .filter((semester) =>
              Object.values(Semester).includes(semester as Semester)
            ) ?? []) as Semester[])
        : localSemesters,
    [searchParams, persistent, localSemesters]
  );

  const { includedCourses, excludedCourses } = useMemo(
    () =>
      getFilteredCourses(
        courses,
        currentInstructionMethods,
        currentLevels,
        currentSemesters
      ),
    [courses, currentInstructionMethods, currentLevels, currentSemesters]
  );

  const index = useMemo(() => initialize(includedCourses), [includedCourses]);

  const currentCourses = useMemo(() => {
    let filteredClasses = currentQuery
      ? index
          // Limit query because Fuse performance decreases linearly by
          // n (field length) * m (pattern length) * l (maximum Levenshtein distance)
          .search(currentQuery.slice(0, 24))
          .map(({ refIndex }) => includedCourses[refIndex])
      : includedCourses;

    if (currentSortBy) {
      // Clone the courses to avoid sorting in-place
      filteredClasses = structuredClone(filteredClasses).sort((a, b) => {
        if (currentSortBy === SortBy.AverageGrade) {
          return b.gradeDistribution.average === a.gradeDistribution.average
            ? 0
            : b.gradeDistribution.average === null
              ? -1
              : a.gradeDistribution.average === null
                ? 1
                : b.gradeDistribution.average - a.gradeDistribution.average;
        }

        // Classes are by default sorted by relevance and number
        return 0;
      });
    }

    return filteredClasses;
  }, [currentQuery, index, includedCourses, currentSortBy]);

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
          currentCourses={currentCourses}
          includedCourses={includedCourses}
          excludedCourses={excludedCourses}
          // Current filters
          currentQuery={currentQuery}
          currentInstructionMethods={currentInstructionMethods}
          currentLevels={currentLevels}
          currentSemesters={currentSemesters}
          // Update local filters
          setCurrentQuery={setLocalQuery}
          setCurrentLevels={setLocalLevels}
          setCurrentSortBy={setLocalSortBy}
          setCurrentInstructionMethods={setLocalInstructionMethods}
          setCurrentSemesters={setLocalSemesters}
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
          loading={loading && courses.length === 0}
          // Manage courses
          onSelect={onSelect}
          currentCourses={currentCourses}
          // Current filters
          currentQuery={currentQuery}
          // Update local filters
          setCurrentQuery={setLocalQuery}
        />
      )}
    </div>
  );
}
