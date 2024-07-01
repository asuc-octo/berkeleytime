import { useMemo, useState } from "react";

import * as Checkbox from "@radix-ui/react-checkbox";
import * as RadioGroup from "@radix-ui/react-radio-group";
import classNames from "classnames";
import { Check, NavArrowDown, NavArrowUp } from "iconoir-react";
import { useSearchParams } from "react-router-dom";

import { Component, IClass, Semester, components } from "@/lib/api";

import Header from "../Header";
import {
  Day,
  Level,
  SortBy,
  Unit,
  getFilteredClasses,
  getLevel,
} from "../browser";
import styles from "./Filters.module.scss";

interface FiltersProps {
  overlay: boolean;
  block: boolean;
  includedClasses: IClass[];
  excludedClasses: IClass[];
  currentClasses: IClass[];
  currentComponents: Component[];
  currentUnits: Unit[];
  currentLevels: Level[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
  currentSemester: Semester;
  currentYear: number;
  currentQuery: string;
  currentDays: Day[];
  currentSortBy: SortBy;
  currentOpen: boolean;
  currentOnline: boolean;
  setCurrentSortBy: (sortBy: SortBy) => void;
  setCurrentQuery: (query: string) => void;
  setCurrentComponents: (components: Component[]) => void;
  setCurrentUnits: (units: Unit[]) => void;
  setCurrentLevels: (levels: Level[]) => void;
  setCurrentDays: (days: Day[]) => void;
  setCurrentOpen: (open: boolean) => void;
  setCurrentOnline: (online: boolean) => void;
  persistent?: boolean;
}

export default function Filters({
  overlay,
  block,
  includedClasses,
  excludedClasses,
  currentClasses,
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
  currentOpen,
  currentOnline,
  setCurrentSortBy,
  setCurrentQuery,
  setCurrentComponents,
  setCurrentUnits,
  setCurrentLevels,
  setCurrentDays,
  setCurrentOpen,
  setCurrentOnline,
  persistent,
}: FiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const filteredLevels = useMemo(() => {
    const classes =
      currentLevels.length === 0
        ? includedClasses
        : getFilteredClasses(
            excludedClasses,
            currentComponents,
            currentUnits,
            [],
            currentDays,
            currentOpen,
            currentOnline
          ).includedClasses;

    return classes.reduce(
      (acc, _class) => {
        const level = getLevel(
          _class.course.academicCareer,
          _class.course.number
        );

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
    excludedClasses,
    includedClasses,
    currentUnits,
    currentComponents,
    currentLevels,
    currentDays,
    currentOpen,
    currentOnline,
  ]);

  const filteredComponents = useMemo(() => {
    const filteredComponents = Object.keys(components).reduce(
      (acc, component) => {
        acc[component] = 0;
        return acc;
      },
      {} as Record<string, number>
    );

    const classes =
      currentComponents.length === 0
        ? includedClasses
        : getFilteredClasses(
            excludedClasses,
            [],
            currentUnits,
            currentLevels,
            currentDays,
            currentOpen,
            currentOnline
          ).includedClasses;

    for (const _class of classes) {
      const { component } = _class.primarySection;

      filteredComponents[component] += 1;
    }

    return filteredComponents;
  }, [
    excludedClasses,
    includedClasses,
    currentComponents,
    currentUnits,
    currentLevels,
    currentDays,
    currentOpen,
    currentOnline,
  ]);

  const filteredDays = useMemo(() => {
    const filteredDays = Object.values(Day).reduce(
      (acc, day) => {
        acc[day] = 0;
        return acc;
      },
      {} as Record<Day, number>
    );

    const classes =
      currentDays.length === 0
        ? includedClasses
        : getFilteredClasses(
            excludedClasses,
            currentComponents,
            currentUnits,
            currentLevels,
            [],
            currentOpen,
            currentOnline
          ).includedClasses;

    for (const _class of classes) {
      const days = _class.primarySection.meetings?.[0]?.days;

      for (const index in days) {
        if (!days[index]) continue;

        filteredDays[index as Day] += 1;
      }
    }

    return filteredDays;
  }, [
    excludedClasses,
    includedClasses,
    currentComponents,
    currentUnits,
    currentLevels,
    currentDays,
    currentOpen,
    currentOnline,
  ]);

  const filteredUnits = useMemo(() => {
    const filteredUnits = Object.values(Unit).reduce(
      (acc, units) => {
        acc[units] = 0;
        return acc;
      },
      {} as Record<Unit, number>
    );

    const classes =
      currentUnits.length === 0
        ? includedClasses
        : getFilteredClasses(
            excludedClasses,
            currentComponents,
            [],
            currentLevels,
            currentDays,
            currentOpen,
            currentOnline
          ).includedClasses;

    for (const _class of classes) {
      const unitsMin = Math.floor(_class.unitsMin);
      const unitsMax = Math.floor(_class.unitsMax);

      [...Array(unitsMax - unitsMin || 1)].forEach((_, index) => {
        const units = unitsMin + index;

        filteredUnits[
          units === 5 ? Unit.FivePlus : (units.toString() as Unit)
        ] += 1;
      });
    }

    return filteredUnits;
  }, [
    excludedClasses,
    includedClasses,
    currentUnits,
    currentComponents,
    currentLevels,
    currentDays,
    currentOpen,
    currentOnline,
  ]);

  const amountOpen = useMemo(
    () => includedClasses.filter((_class) => _class.primarySection.open).length,
    [includedClasses]
  );

  const amountOnline = useMemo(
    () =>
      includedClasses.filter((_class) => _class.primarySection.online).length,
    [includedClasses]
  );

  const updateBoolean = (
    name: string,
    setState: (state: boolean) => void,
    value: boolean
  ) => {
    if (persistent) {
      if (value) searchParams.set(name, "");
      else searchParams.delete(name);
      setSearchParams(searchParams);

      return;
    }

    setState(value);
  };

  const updateArray = <T,>(
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
          currentClasses={currentClasses}
          currentSemester={currentSemester}
          currentYear={currentYear}
          currentQuery={currentQuery}
          overlay={overlay}
          setCurrentQuery={setCurrentQuery}
        />
      )}
      <div className={styles.body}>
        <p className={styles.label}>Quick filters</p>
        <div className={styles.filter}>
          <Checkbox.Root
            className={styles.checkbox}
            onCheckedChange={(value) =>
              updateBoolean("open", setCurrentOpen, value as boolean)
            }
            id="open"
          >
            <Checkbox.Indicator asChild>
              <Check width={12} height={12} />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <label className={styles.text} htmlFor="open">
            <span className={styles.value}>Open</span>
            {!currentOpen && ` (${amountOpen.toLocaleString()})`}
          </label>
        </div>
        <div className={styles.filter}>
          <Checkbox.Root
            id="online"
            className={styles.checkbox}
            onCheckedChange={(value) =>
              updateBoolean("online", setCurrentOnline, value as boolean)
            }
          >
            <Checkbox.Indicator asChild>
              <Check width={12} height={12} />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <label className={styles.text} htmlFor="online">
            <span className={styles.value}>Online</span>
            {!currentOnline && ` (${amountOnline.toLocaleString()})`}
          </label>
        </div>
        <div className={styles.filter}>
          <Checkbox.Root className={styles.checkbox}>
            <Checkbox.Indicator asChild>
              <Check width={12} height={12} />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <label className={styles.text}>
            <span className={styles.value}>Bookmarked</span>
          </label>
        </div>
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
                  updateArray(
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
                  updateArray(
                    "units",
                    currentUnits,
                    setCurrentUnits,
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
                    updateArray(
                      "components",
                      currentComponents,
                      setCurrentComponents,
                      component as Component,
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
                  updateArray(
                    "days",
                    currentDays,
                    setCurrentDays,
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
