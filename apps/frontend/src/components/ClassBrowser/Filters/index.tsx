import { Dispatch, useEffect, useMemo, useState } from "react";

import classNames from "classnames";
import {
  Check,
  NavArrowDown,
  NavArrowUp,
  SortDown,
  SortUp,
} from "iconoir-react";
import { Checkbox } from "radix-ui";

import { Button, DaySelect, Select } from "@repo/theme";

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

// TODO: Add Mode of Instruction

// TODO: Add requirements from relevant sources

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
    // updateOpen,
    online,
    // updateOnline,
    sortBy,
    reverse,
    updateSortBy,
    responsive,
    updateReverse,
  } = useBrowser();

  const [expanded, setExpanded] = useState(false);

  const [daysArray, setDaysArray] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  useEffect(() => {
    const newDays = daysArray.reduce((acc, v, i) => {
      if (v) acc.push(i.toString() as Day);
      return acc;
    }, [] as Day[]);
    updateDays(newDays);
  }, [daysArray]);

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

  // const filteredDays = useMemo(() => {
  //   const filteredDays = Object.values(Day).reduce(
  //     (acc, day) => {
  //       acc[day] = 0;
  //       return acc;
  //     },
  //     {} as Record<Day, number>
  //   );

  //   const classes =
  //     days.length === 0
  //       ? includedClasses
  //       : getFilteredClasses(
  //           excludedClasses,
  //           components,
  //           units,
  //           levels,
  //           [],
  //           open,
  //           online
  //         ).includedClasses;

  //   for (const _class of classes) {
  //     const days = _class.primarySection.meetings?.[0]?.days;

  //     for (const index in days) {
  //       if (!days[index]) continue;

  //       filteredDays[index as Day] += 1;
  //     }
  //   }

  //   return filteredDays;
  // }, [
  //   excludedClasses,
  //   includedClasses,
  //   components,
  //   units,
  //   levels,
  //   days,
  //   open,
  //   online,
  // ]);

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

  // const amountOpen = useMemo(
  //   () =>
  //     includedClasses.filter(
  //       (_class) => _class.primarySection.enrollment?.latest.status === "O"
  //     ).length,
  //   [includedClasses]
  // );

  // const amountOnline = useMemo(
  //   () =>
  //     includedClasses.filter((_class) => _class.primarySection.online).length,
  //   [includedClasses]
  // );

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
        <p className={styles.label}>SORT BY</p>
        <div className={styles.sortControls}>
          <div className={styles.sortSelectLeft}>
            <Select
              value={sortBy}
              onChange={(value) => updateSortBy(value as SortBy)}
              options={Object.values(SortBy).map((sortBy) => {
                return { value: sortBy, label: sortBy };
              })}
            />
          </div>
          <div>
            <button
              className={styles.sortSelectRightButton}
              onClick={() => updateReverse((previous) => !previous)}
            >
              {reverse ? <SortUp /> : <SortDown />}
            </button>
          </div>
        </div>

        <p className={styles.label}>LEVEL</p>
        <Select
          multi
          value={levels}
          onChange={(v) => {
            if (Array.isArray(v)) updateLevels(v);
          }}
          options={Object.values(Level).map((level) => {
            return {
              value: level,
              label: level,
              meta: filteredLevels[level].toString(),
            };
          })}
        />
        <p className={styles.label}>UNITS</p>
        <Select
          multi
          value={units}
          onChange={(v) => {
            if (Array.isArray(v)) updateUnits(v);
          }}
          options={Object.values(Unit).map((unit) => {
            return {
              value: unit,
              label: unit,
              meta: filteredUnits[unit].toString(),
            };
          })}
        />
        <p className={styles.label}>DAY</p>
        <DaySelect
          days={daysArray}
          updateDays={(v) => {
            setDaysArray([...v]);
          }}
          size="sm"
        />
        <p className={styles.label}>KIND</p>
        {Object.keys(filteredComponents)
          .slice(0, expanded ? undefined : 5)
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
        <Button
          variant="tertiary"
          noFill
          onClick={() => setExpanded(!expanded)}
          as="button"
          style={{ marginTop: 15 }}
        >
          {expanded ? "Show less" : "Show more"}
          {expanded ? <NavArrowUp /> : <NavArrowDown />}
        </Button>
      </div>
    </div>
  );
}
