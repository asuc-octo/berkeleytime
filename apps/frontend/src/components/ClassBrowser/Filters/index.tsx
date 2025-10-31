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
import { useNavigate } from "react-router-dom";

import { Button, DaySelect, IconButton, Select } from "@repo/theme";

import { Component, componentMap } from "@/lib/api";
import { sortByTermDescending } from "@/lib/classes";

import Header from "../Header";
import {
  Day,
  Level,
  SortBy,
  Unit,
  getAllBreadthRequirements,
  getAllUniversityRequirements,
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
    breadths,
    updateBreadths,
    universityRequirement,
    updateUniversityRequirement,
    open,
    // updateOpen,
    online,
    // updateOnline,
    sortBy,
    reverse,
    effectiveOrder,
    updateSortBy,
    responsive,
    updateReverse,
    year,
    semester,
    terms,
  } = useBrowser();

  const navigate = useNavigate();

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

  const filteredBreadths = useMemo(() => {
    return getAllBreadthRequirements([...includedClasses, ...excludedClasses]);
  }, [includedClasses]);

  const filteredUniversityRequirements = useMemo(() => {
    return getAllUniversityRequirements([
      ...includedClasses,
      ...excludedClasses,
    ]);
  }, [includedClasses]);

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

  const isAscending = effectiveOrder === "asc";
  const nextOrderLabel = isAscending ? "descending" : "ascending";

  const availableTerms = useMemo(() => {
    if (!terms) return [];

    return terms
      .filter(
        ({ year, semester }, index) =>
          index ===
          terms.findIndex(
            (term) => term.semester === semester && term.year === year
          )
      )
      .toSorted(sortByTermDescending);
  }, [terms]);

  const currentTermLabel = `${semester} ${year}`;

  return (
    <div
      className={classNames(styles.root, {
        [styles.responsive]: responsive,
      })}
    >
      <Header />
      <div className={styles.body}>
        {terms && terms.length > 0 && (
          <>
            <p className={styles.label}>TERM</p>
            <Select
              value={currentTermLabel}
              onChange={(value) => {
                const selectedTerm = availableTerms.find(
                  (term) => `${term.semester} ${term.year}` === value
                );
                if (selectedTerm) {
                  navigate(
                    `/catalog/${selectedTerm.year}/${selectedTerm.semester}`
                  );
                }
              }}
              options={availableTerms.map((term) => ({
                value: `${term.semester} ${term.year}`,
                label: `${term.semester} ${term.year}`,
              }))}
            />
          </>
        )}
        <p className={styles.label}>SORT BY</p>
        <div className={styles.sortControls}>
          <Select
            value={sortBy}
            onChange={(value) => updateSortBy(value as SortBy)}
            options={Object.values(SortBy).map((sortOption) => {
              return { value: sortOption, label: sortOption };
            })}
          />
          <IconButton
            className={styles.sortToggleButton}
            onClick={() => updateReverse((previous) => !previous)}
            aria-label={`Switch to ${nextOrderLabel} order`}
            title={`Switch to ${nextOrderLabel} order`}
            aria-pressed={reverse}
            style={{ width: 44, height: 44 }}
          >
            {isAscending ? (
              <SortUp width={16} height={16} />
            ) : (
              <SortDown width={16} height={16} />
            )}
          </IconButton>
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
        <p className={styles.label}>L&S REQUIREMENTS</p>
        <Select
          multi
          value={breadths}
          onChange={(v) => {
            if (Array.isArray(v)) updateBreadths(v);
          }}
          options={filteredBreadths.map((breadth) => {
            return {
              value: breadth,
              label: breadth,
            };
          })}
        />
        <p className={styles.label}>UNIVERSITY REQUIREMENTS</p>
        <Select
          value={universityRequirement}
          onChange={(v) => {
            updateUniversityRequirement(v as string | null);
          }}
          options={[
            { value: null, label: "None" },
            ...filteredUniversityRequirements.map((requirement) => {
              return {
                value: requirement,
                label: requirement,
              };
            }),
          ]}
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
          .filter((component) => componentMap[component as Component])
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
