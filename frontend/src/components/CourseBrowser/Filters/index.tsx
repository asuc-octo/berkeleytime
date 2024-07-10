import { useMemo, useState } from "react";

import * as Checkbox from "@radix-ui/react-checkbox";
import * as RadioGroup from "@radix-ui/react-radio-group";
import classNames from "classnames";
import { Check, NavArrowDown, NavArrowUp } from "iconoir-react";
import { useSearchParams } from "react-router-dom";

import {
  ICourse,
  InstructionMethod,
  Semester,
  instructionMethodMap,
} from "@/lib/api";

import Header from "../Header";
import { Level, SortBy, getFilteredCourses, getLevel } from "../browser";
import styles from "./Filters.module.scss";

interface FiltersProps {
  overlay: boolean;
  block: boolean;
  includedCourses: ICourse[];
  excludedCourses: ICourse[];
  currentCourses: ICourse[];
  currentInstructionMethods: InstructionMethod[];
  currentLevels: Level[];
  currentSemesters: Semester[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
  currentQuery: string;
  currentSortBy: SortBy;
  setCurrentSortBy: (sortBy: SortBy) => void;
  setCurrentQuery: (query: string) => void;
  setCurrentInstructionMethods: (components: InstructionMethod[]) => void;
  setCurrentLevels: (levels: Level[]) => void;
  setCurrentSemesters: (semesters: Semester[]) => void;
  persistent?: boolean;
}

export default function Filters({
  overlay,
  block,
  includedCourses,
  excludedCourses,
  currentCourses,
  currentInstructionMethods,
  currentLevels,
  currentSemesters,
  setCurrentSemesters,
  onOpenChange,
  open,
  currentQuery,
  currentSortBy,
  setCurrentSortBy,
  setCurrentQuery,
  setCurrentInstructionMethods,
  setCurrentLevels,
  persistent,
}: FiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const filteredLevels = useMemo(() => {
    const courses =
      currentLevels.length === 0
        ? includedCourses
        : getFilteredCourses(
            excludedCourses,
            currentInstructionMethods,
            [],
            currentSemesters
          ).includedCourses;

    return courses.reduce(
      (acc, course) => {
        const level = getLevel(course.academicCareer, course.number);

        acc[level] += 1;

        return acc;
      },
      {
        "Lower Division": 0,
        "Upper Division": 0,
        Graduate: 0,
        Extension: 0,
      } as Record<Level, number>
    );
  }, [
    excludedCourses,
    includedCourses,
    currentInstructionMethods,
    currentLevels,
  ]);

  const filteredSemesters = useMemo(() => {
    const filteredSemesters = Object.keys(Semester).reduce(
      (acc, semester) => {
        acc[semester] = 0;
        return acc;
      },
      {} as Record<string, number>
    );

    const courses =
      currentSemesters.length === 0
        ? includedCourses
        : getFilteredCourses(
            excludedCourses,
            currentInstructionMethods,
            currentLevels,
            []
          ).includedCourses;

    for (const course of courses) {
      if (!course.typicallyOffered) continue;

      for (const semester of course.typicallyOffered) {
        filteredSemesters[semester] += 1;
      }
    }

    return filteredSemesters;
  }, [excludedCourses, includedCourses, currentSemesters]);

  const filteredInstructionMethods = useMemo(() => {
    const filteredInstructionMethods = Object.keys(instructionMethodMap).reduce(
      (acc, component) => {
        acc[component] = 0;
        return acc;
      },
      {} as Record<string, number>
    );

    const courses =
      currentInstructionMethods.length === 0
        ? includedCourses
        : getFilteredCourses(
            excludedCourses,
            [],
            currentLevels,
            currentSemesters
          ).includedCourses;

    for (const course of courses) {
      const { primaryInstructionMethod } = course;

      filteredInstructionMethods[primaryInstructionMethod] += 1;
    }

    return filteredInstructionMethods;
  }, [
    excludedCourses,
    includedCourses,
    currentInstructionMethods,
    currentLevels,
  ]);

  const update = <T,>(
    name: string,
    state: T[],
    setState: (state: T[]) => void,
    value: T,
    checked: boolean
  ) => {
    if (persistent) {
      if (checked) {
        searchParams.set(name, [...state, value].join(","));
      } else {
        const filtered = state.filter((parameter) => parameter !== value);

        if (filtered.length > 0) {
          searchParams.set(name, filtered.join(","));
        } else {
          searchParams.delete(name);
        }
      }

      setSearchParams(searchParams);

      return;
    }

    setState(
      checked
        ? [...state, value]
        : state.filter((parameter) => parameter !== value)
    );
  };

  const handleValueChange = (value: SortBy) => {
    if (persistent) {
      if (value === SortBy.Relevance) searchParams.delete("sortBy");
      else searchParams.set("sortBy", value);
      setSearchParams(searchParams);

      return;
    }

    setCurrentSortBy(value);
  };

  return (
    <div
      className={classNames(styles.root, {
        [styles.overlay]: overlay,
        [styles.block]: block,
      })}
    >
      {open && overlay && (
        <Header
          onOpenChange={onOpenChange}
          open={true}
          className={styles.header}
          currentCourses={currentCourses}
          currentQuery={currentQuery}
          overlay={overlay}
          setCurrentQuery={setCurrentQuery}
        />
      )}
      <div className={styles.body}>
        <p className={styles.label}>Sort by</p>
        <RadioGroup.Root
          onValueChange={handleValueChange}
          value={currentSortBy}
        >
          {Object.values(SortBy).map((sortBy) => {
            const key = `sortBy-${sortBy}`;

            return (
              <div className={styles.filter} key={key}>
                <RadioGroup.Item
                  className={styles.radio}
                  id={key}
                  value={sortBy}
                >
                  <RadioGroup.Indicator />
                </RadioGroup.Item>
                <label className={styles.text} htmlFor={key}>
                  <span className={styles.value}>{sortBy}</span>
                </label>
              </div>
            );
          })}
        </RadioGroup.Root>
        <p className={styles.label}>Level</p>
        {Object.values(Level).map((level) => {
          const active = currentLevels.includes(level as Level);

          const key = `level-${level}`;

          return (
            <div className={styles.filter} key={key}>
              <Checkbox.Root
                className={styles.checkbox}
                checked={active}
                id={key}
                onCheckedChange={(checked) =>
                  update(
                    "levels",
                    currentLevels,
                    setCurrentLevels,
                    level,
                    checked as boolean
                  )
                }
              >
                <Checkbox.Indicator asChild>
                  <Check width={12} height={12} />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <label className={styles.text} htmlFor={key}>
                <span className={styles.value}>{level}</span>
                {!active && ` (${filteredLevels[level].toLocaleString()})`}
              </label>
            </div>
          );
        })}
        <p className={styles.label}>Semester</p>
        {Object.values(Semester).map((semester) => {
          const active = currentSemesters.includes(semester as Semester);

          const key = `semester-${semester}`;

          return (
            <div className={styles.filter} key={key}>
              <Checkbox.Root
                className={styles.checkbox}
                checked={active}
                id={key}
                onCheckedChange={(checked) =>
                  update(
                    "semesters",
                    currentSemesters,
                    setCurrentSemesters,
                    semester,
                    checked as boolean
                  )
                }
              >
                <Checkbox.Indicator asChild>
                  <Check width={12} height={12} />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <label className={styles.text} htmlFor={key}>
                <span className={styles.value}>{semester}</span>
                {!active &&
                  ` (${filteredSemesters[semester].toLocaleString()})`}
              </label>
            </div>
          );
        })}
        <p className={styles.label}>Kind</p>
        {Object.keys(filteredInstructionMethods)
          .slice(0, expanded ? undefined : 5)
          .map((instructionMethod) => {
            const active = currentInstructionMethods.includes(
              instructionMethod as InstructionMethod
            );

            const key = `instruction-method-${instructionMethod}`;

            return (
              <div className={styles.filter} key={key}>
                <Checkbox.Root
                  className={styles.checkbox}
                  checked={active}
                  id={key}
                  onCheckedChange={(checked) =>
                    update(
                      "components",
                      currentInstructionMethods,
                      setCurrentInstructionMethods,
                      instructionMethod as InstructionMethod,
                      checked as boolean
                    )
                  }
                >
                  <Checkbox.Indicator asChild>
                    <Check width={12} height={12} />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label className={styles.text} htmlFor={key}>
                  <span className={styles.value}>
                    {
                      instructionMethodMap[
                        instructionMethod as InstructionMethod
                      ]
                    }
                  </span>
                  {!active &&
                    ` (${filteredInstructionMethods[instructionMethod].toLocaleString()})`}
                </label>
              </div>
            );
          })}
        <div className={styles.button} onClick={() => setExpanded(!expanded)}>
          {expanded ? <NavArrowUp /> : <NavArrowDown />}
          {expanded ? "View less" : "View more"}
        </div>
      </div>
    </div>
  );
}
