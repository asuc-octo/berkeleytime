import { useMemo, useState } from "react";

import * as Checkbox from "@radix-ui/react-checkbox";
import * as RadioGroup from "@radix-ui/react-radio-group";
import classNames from "classnames";
import { Check, NavArrowDown, NavArrowUp } from "iconoir-react";
import { useSearchParams } from "react-router-dom";

import { ICourse, InstructionMethod, instructionMethods } from "@/lib/api";

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
  onOpenChange: (open: boolean) => void;
  open: boolean;
  currentQuery: string;
  currentSortBy: SortBy;
  setCurrentSortBy: (sortBy: SortBy) => void;
  setCurrentQuery: (query: string) => void;
  setCurrentInstructionMethods: (components: InstructionMethod[]) => void;
  setCurrentLevels: (levels: Level[]) => void;
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
        : getFilteredCourses(excludedCourses, currentInstructionMethods, [])
            .includedCourses;

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

  const filteredInstructionMethods = useMemo(() => {
    const filteredInstructionMethods = Object.keys(instructionMethods).reduce(
      (acc, component) => {
        acc[component] = 0;
        return acc;
      },
      {} as Record<string, number>
    );

    const courses =
      currentInstructionMethods.length === 0
        ? includedCourses
        : getFilteredCourses(excludedCourses, [], currentLevels)
            .includedCourses;

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

    console.log(value);
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
          {Object.values(SortBy).map((sortBy) => (
            <div className={styles.filter}>
              <RadioGroup.Item
                className={styles.radio}
                id={`sortBy-${sortBy}`}
                value={sortBy}
              >
                <RadioGroup.Indicator />
              </RadioGroup.Item>
              <label className={styles.text} htmlFor={`sortBy-${sortBy}`}>
                <span className={styles.value}>{sortBy}</span>
              </label>
            </div>
          ))}
        </RadioGroup.Root>
        <p className={styles.label}>Level</p>
        {Object.values(Level).map((level) => {
          const active = currentLevels.includes(level as Level);

          return (
            <div className={styles.filter}>
              <Checkbox.Root
                className={styles.checkbox}
                checked={active}
                id={`level-${level}`}
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
              <label className={styles.text} htmlFor={`level-${level}`}>
                <span className={styles.value}>{level}</span>
                {!active && ` (${filteredLevels[level].toLocaleString()})`}
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

            return (
              <div className={styles.filter}>
                <Checkbox.Root
                  className={styles.checkbox}
                  checked={active}
                  id={`instruction-method-${instructionMethod}`}
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
                <label
                  className={styles.text}
                  htmlFor={`instruction-method-${instructionMethod}`}
                >
                  <span className={styles.value}>
                    {instructionMethods[instructionMethod as InstructionMethod]}
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
