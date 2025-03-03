import { Dispatch, useMemo } from "react";

import classNames from "classnames";
import { Check } from "iconoir-react";
import { Checkbox, RadioGroup } from "radix-ui";

import { Component, componentMap } from "@/lib/api";

import Header from "../Header";
import {
  Day,
  Level,
  SortBy,
  Unit,
  getFilteredClasses,
  getLevel,
} from "../browser";
import useBrowser from "../useBrowser";
import styles from "./Filters.module.scss";

export default function Filters() {
  const {
    includedClasses,
    excludedClasses,
    components,
    updateComponents,
    units,
    updateUnits,
    levels,
    updateLevels,
    days,
    updateDays,
    open,
    updateOpen,
    online,
    updateOnline,
    sortBy,
    updateSortBy,
    responsive,
  } = useBrowser();

  const filteredLevels = useMemo(() => {
    const classes =
      levels.length === 0
        ? includedClasses
        : getFilteredClasses(
            excludedClasses,
            components,
            units,
            [],
            days,
            open,
            online
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
    units,
    components,
    levels,
    days,
    open,
    online,
  ]);

  const filteredComponents = useMemo(() => {
    const filteredComponents = Object.keys(componentMap).reduce(
      (acc, component) => {
        acc[component] = 0;
        return acc;
      },
      {} as Record<string, number>
    );

    const classes =
      components.length === 0
        ? includedClasses
        : getFilteredClasses(
            excludedClasses,
            [],
            units,
            levels,
            days,
            open,
            online
          ).includedClasses;

    for (const _class of classes) {
      const { component } = _class.primarySection;

      filteredComponents[component] += 1;
    }

    return filteredComponents;
  }, [
    excludedClasses,
    includedClasses,
    components,
    units,
    levels,
    days,
    open,
    online,
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
      days.length === 0
        ? includedClasses
        : getFilteredClasses(
            excludedClasses,
            components,
            units,
            levels,
            [],
            open,
            online
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
    components,
    units,
    levels,
    days,
    open,
    online,
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
      units.length === 0
        ? includedClasses
        : getFilteredClasses(
            excludedClasses,
            components,
            [],
            levels,
            days,
            open,
            online
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
    units,
    components,
    levels,
    days,
    open,
    online,
  ]);

  const amountOpen = useMemo(
    () =>
      includedClasses.filter(
        (_class) => _class.primarySection.enrollment.latest.status === "O"
      ).length,
    [includedClasses]
  );

  const amountOnline = useMemo(
    () =>
      includedClasses.filter((_class) => _class.primarySection.online).length,
    [includedClasses]
  );

  const updateArray = <T,>(
    state: T[],
    setState: Dispatch<T[]>,
    value: T,
    checked: boolean
  ) => {
    setState(
      checked
        ? [...state, value]
        : state.filter((previousValue) => previousValue !== value)
    );
  };

  return (
    <div
      className={classNames(styles.root, {
        [styles.responsive]: responsive,
      })}
    >
      <Header />
      <div className={styles.body}>
        <p className={styles.label}>Quick filters</p>
        <div className={styles.filter}>
          <Checkbox.Root
            className={styles.checkbox}
            onCheckedChange={(value) => updateOpen(value as boolean)}
            id="open"
          >
            <Checkbox.Indicator asChild>
              <Check width={12} height={12} />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <label className={styles.text} htmlFor="open">
            <span className={styles.value}>Open</span>
            {!open && ` (${amountOpen.toLocaleString()})`}
          </label>
        </div>
        <div className={styles.filter}>
          <Checkbox.Root
            id="online"
            className={styles.checkbox}
            onCheckedChange={(value) => updateOnline(value as boolean)}
          >
            <Checkbox.Indicator asChild>
              <Check width={12} height={12} />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <label className={styles.text} htmlFor="online">
            <span className={styles.value}>Online</span>
            {!online && ` (${amountOnline.toLocaleString()})`}
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
          onValueChange={(value) => updateSortBy(value as SortBy)}
          value={sortBy}
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
          const active = levels.includes(level as Level);

          const key = `level-${level}`;

          return (
            <div className={styles.filter} key={key}>
              <Checkbox.Root
                className={styles.checkbox}
                checked={active}
                id={key}
                onCheckedChange={(checked) =>
                  updateArray(levels, updateLevels, level, checked as boolean)
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
        <p className={styles.label}>Units</p>
        {Object.values(Unit).map((unit) => {
          const active = units.includes(unit);

          const key = `units-${unit}`;

          return (
            <div className={styles.filter} key={key}>
              <Checkbox.Root
                className={styles.checkbox}
                checked={active}
                id={key}
                onCheckedChange={(checked) =>
                  updateArray(units, updateUnits, unit, checked as boolean)
                }
              >
                <Checkbox.Indicator asChild>
                  <Check width={12} height={12} />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <label className={styles.text} htmlFor={key}>
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
          // .slice(0, expanded ? undefined : 5)
          .map((component) => {
            const active = components.includes(component as Component);

            const key = `component-${component}`;

            return (
              <div className={styles.filter} key={key}>
                <Checkbox.Root
                  className={styles.checkbox}
                  checked={active}
                  id={key}
                  onCheckedChange={(checked) =>
                    updateArray(
                      components,
                      updateComponents,
                      component as Component,
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
                    {componentMap[component as Component]}
                  </span>
                  {!active &&
                    ` (${filteredComponents[component].toLocaleString()})`}
                </label>
              </div>
            );
          })}
        {/*<div className={styles.button} onClick={() => setExpanded(!expanded)}>
          {expanded ? <NavArrowUp /> : <NavArrowDown />}
          {expanded ? "View less" : "View more"}
        </div>*/}
        <p className={styles.label}>Day</p>
        {Object.entries(Day).map(([property, day]) => {
          const active = days.includes(day);

          const key = `day-${day}`;

          return (
            <div className={styles.filter} key={key}>
              <Checkbox.Root
                className={styles.checkbox}
                checked={active}
                id={key}
                onCheckedChange={(checked) =>
                  updateArray(days, updateDays, day, checked as boolean)
                }
              >
                <Checkbox.Indicator asChild>
                  <Check width={12} height={12} />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <label className={styles.text} htmlFor={key}>
                <span className={styles.value}>{property}</span>
                {!active && ` (${filteredDays[day].toLocaleString()})`}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
