import { useMemo, useState } from "react";

import * as Checkbox from "@radix-ui/react-checkbox";
import * as RadioGroup from "@radix-ui/react-radio-group";
import classNames from "classnames";
import { Check, NavArrowDown, NavArrowUp } from "iconoir-react";
import { useSearchParams } from "react-router-dom";

import { Component, ICourse, Semester, components } from "@/lib/api";

import Header from "../Header";
import {
  Day,
  Level,
  SortBy,
  Unit,
  getFilteredCourses,
  getLevel,
} from "../browser";
import styles from "./Filters.module.scss";

interface FiltersProps {
  overlay: boolean;
  block: boolean;
  includedCourses: ICourse[];
  excludedCourses: ICourse[];
  currentCourses: ICourse[];
  currentComponents: Component[];
  currentUnits: Unit[];
  currentLevels: Level[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
  currentSemester: Semester;
  currentYear: number;
  currentQuery: string;
  currentDays: Day[];
  currentSortBy?: SortBy;
}

export default function Filters({
  overlay,
  block,
  includedCourses,
  excludedCourses,
  currentCourses,
  currentComponents,
  currentLevels,
  currentUnits,
  currentDays,
  onOpenChange,
  open,
  currentSemester,
  currentYear,
  currentQuery,
  currentSortBy,
}: FiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const filteredLevels = useMemo(() => {
    const courses =
      currentLevels.length === 0
        ? includedCourses
        : getFilteredCourses(
            excludedCourses,
            currentComponents,
            currentUnits,
            [],
            currentDays
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
    currentUnits,
    currentComponents,
    currentLevels,
    currentDays,
  ]);

  const filteredComponents = useMemo(() => {
    const filteredComponents = Object.keys(components).reduce(
      (acc, component) => {
        acc[component] = 0;
        return acc;
      },
      {} as Record<string, number>
    );

    const courses =
      currentComponents.length === 0
        ? includedCourses
        : getFilteredCourses(
            excludedCourses,
            [],
            currentUnits,
            currentLevels,
            currentDays
          ).includedCourses;

    for (const course of courses) {
      const { component } = course.classes[0].primarySection;

      filteredComponents[component] += 1;
    }

    return filteredComponents;
  }, [
    excludedCourses,
    includedCourses,
    currentComponents,
    currentUnits,
    currentLevels,
    currentDays,
  ]);

  const filteredDays = useMemo(() => {
    const filteredDays = Object.values(Day).reduce(
      (acc, day) => {
        acc[day] = 0;
        return acc;
      },
      {} as Record<Day, number>
    );

    const courses =
      currentDays.length === 0
        ? includedCourses
        : getFilteredCourses(
            excludedCourses,
            currentComponents,
            currentUnits,
            currentLevels,
            []
          ).includedCourses;

    for (const course of courses) {
      const days = course.classes.reduce(
        (acc, { primarySection: { meetings } }) => {
          const days = meetings?.[0]?.days;

          if (!days) return acc;

          return [
            acc[0] || days[0],
            acc[1] || days[1],
            acc[2] || days[2],
            acc[3] || days[3],
            acc[4] || days[4],
            acc[5] || days[5],
            acc[6] || days[6],
          ];
        },
        [] as boolean[]
      );

      for (const index in days) {
        if (!days[index]) continue;

        filteredDays[index as Day] += 1;
      }
    }

    return filteredDays;
  }, [
    excludedCourses,
    includedCourses,
    currentComponents,
    currentUnits,
    currentLevels,
    currentDays,
  ]);

  const filteredUnits = useMemo(() => {
    const filteredUnits = Object.values(Unit).reduce(
      (acc, units) => {
        acc[units] = 0;
        return acc;
      },
      {} as Record<Unit, number>
    );

    const courses =
      currentUnits.length === 0
        ? includedCourses
        : getFilteredCourses(
            excludedCourses,
            currentComponents,
            [],
            currentLevels,
            currentDays
          ).includedCourses;

    for (const course of courses) {
      const { unitsMin, unitsMax } = course.classes.reduce(
        (acc, { unitsMax, unitsMin }) => ({
          unitsMin: Math.min(5, Math.floor(Math.min(acc.unitsMin, unitsMin))),
          unitsMax: Math.min(Math.floor(Math.max(acc.unitsMax, unitsMax))),
        }),
        { unitsMax: 0, unitsMin: Infinity }
      );

      [...Array(unitsMax - unitsMin || 1)].forEach((_, index) => {
        const units = unitsMin + index;

        filteredUnits[
          units === 5 ? Unit.FivePlus : (units.toString() as Unit)
        ] += 1;
      });
    }

    return filteredUnits;
  }, [
    excludedCourses,
    includedCourses,
    currentUnits,
    currentComponents,
    currentLevels,
    currentDays,
  ]);

  const handleDynamicChange = (
    name: string,
    current: (string | number)[],
    value: string | number,
    checked: boolean
  ) => {
    if (checked) {
      searchParams.set(name, [...current, value].join(","));
    } else {
      const filtered = current.filter((parameter) => parameter !== value);

      if (filtered.length > 0) {
        searchParams.set(name, filtered.join(","));
      } else {
        searchParams.delete(name);
      }
    }

    setSearchParams(searchParams);
  };

  const handleValueChange = (value: string) => {
    if (value === SortBy.Relevance) searchParams.delete("sortBy");
    else searchParams.set("sortBy", value);
    setSearchParams(searchParams);
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
          currentSemester={currentSemester}
          currentYear={currentYear}
          currentQuery={currentQuery}
          overlay={overlay}
        />
      )}
      <div className={styles.body}>
        <p className={styles.label}>Sort by</p>
        <RadioGroup.Root
          onValueChange={handleValueChange}
          value={currentSortBy ?? SortBy.Relevance}
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
                  handleDynamicChange(
                    "levels",
                    currentLevels,
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
        <p className={styles.label}>Units</p>
        {Object.values(Unit).map((unit) => {
          const active = currentUnits.includes(unit);

          return (
            <div className={styles.filter}>
              <Checkbox.Root
                className={styles.checkbox}
                checked={active}
                id={`units-${unit}`}
                onCheckedChange={(checked) =>
                  handleDynamicChange(
                    "units",
                    currentUnits,
                    unit,
                    checked as boolean
                  )
                }
              >
                <Checkbox.Indicator asChild>
                  <Check width={12} height={12} />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <label className={styles.text} htmlFor={`units-${unit}`}>
                <span className={styles.value}>
                  {unit} {unit === Unit.One ? "unit" : "units"}
                </span>
                {!active && ` (${filteredUnits[unit].toLocaleString()})`}
              </label>
            </div>
          );
        })}
        <p className={styles.label}>Kind</p>
        {Object.keys(filteredComponents)
          .slice(0, expanded ? undefined : 5)
          .map((component) => {
            const active = currentComponents.includes(component as Component);

            return (
              <div className={styles.filter}>
                <Checkbox.Root
                  className={styles.checkbox}
                  checked={active}
                  id={`component-${component}`}
                  onCheckedChange={(checked) =>
                    handleDynamicChange(
                      "components",
                      currentComponents,
                      component,
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
                  htmlFor={`component-${component}`}
                >
                  <span className={styles.value}>
                    {components[component as Component]}
                  </span>
                  {!active &&
                    ` (${filteredComponents[component].toLocaleString()})`}
                </label>
              </div>
            );
          })}
        <div className={styles.button} onClick={() => setExpanded(!expanded)}>
          {expanded ? <NavArrowUp /> : <NavArrowDown />}
          {expanded ? "View less" : "View more"}
        </div>
        <p className={styles.label}>Day</p>
        {Object.entries(Day).map(([key, day]) => {
          const active = currentDays.includes(day);

          return (
            <div className={styles.filter}>
              <Checkbox.Root
                className={styles.checkbox}
                checked={active}
                id={`day-${day}`}
                onCheckedChange={(checked) =>
                  handleDynamicChange(
                    "days",
                    currentDays,
                    day,
                    checked as boolean
                  )
                }
              >
                <Checkbox.Indicator asChild>
                  <Check width={12} height={12} />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <label className={styles.text} htmlFor={`day-${day}`}>
                <span className={styles.value}>{key}</span>
                {!active && ` (${filteredDays[day].toLocaleString()})`}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
