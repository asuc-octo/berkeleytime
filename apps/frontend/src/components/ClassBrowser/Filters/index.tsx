import { useEffect, useMemo, useState } from "react";

import classNames from "classnames";
import { SortDown, SortUp } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import { DaySelect, IconButton, Select, Slider } from "@repo/theme";
import type { Option } from "@repo/theme";
import { sortByTermDescending } from "@/lib/classes";

import Header from "../Header";
import {
  Breadth,
  Day,
  Level,
  SortBy,
  getAllBreadthRequirements,
  getAllUniversityRequirements,
  getFilteredClasses,
  getLevel,
  UniversityRequirement,
} from "../browser";
import useBrowser from "../useBrowser";
import styles from "./Filters.module.scss";

// TODO: Add Mode of Instruction

// TODO: Add requirements from relevant sources

type RequirementSelection =
  | { type: "breadth"; value: Breadth }
  | { type: "university"; value: UniversityRequirement };

export default function Filters() {
  const {
    includedClasses,
    excludedClasses,
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

  const defaultDaysState = useMemo(
    () => [false, false, false, false, false, false, false],
    []
  );
  const [daysArray, setDaysArray] = useState(defaultDaysState);

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

  const requirementOptions = useMemo<Option<RequirementSelection>[]>(() => {
    const options: Option<RequirementSelection>[] = [];

    if (filteredBreadths.length > 0) {
      options.push({ type: "label", label: "L&S REQUIREMENTS" });
      options.push(
        ...filteredBreadths.map((breadth) => ({
          value: { type: "breadth", value: breadth } as RequirementSelection,
          label: breadth,
        }))
      );
    }

    if (filteredUniversityRequirements.length > 0) {
      options.push({ type: "label", label: "UNIVERSITY REQUIREMENTS" });
      options.push(
        ...filteredUniversityRequirements.map((requirement) => ({
          value: {
            type: "university",
            value: requirement,
          } as RequirementSelection,
          label: requirement,
        }))
      );
    }

    return options;
  }, [
    filteredBreadths,
    filteredUniversityRequirements,
  ]);
  const selectedRequirements = useMemo<RequirementSelection[]>(
    () => [
      ...breadths.map((breadth) => ({ type: "breadth", value: breadth })),
      ...(universityRequirement
        ? [{ type: "university", value: universityRequirement }]
        : []),
    ],
    [breadths, universityRequirement]
  );

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
  //   units,
  //   levels,
  //   days,
  //   open,
  //   online,
  // ]);

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

  const handleClearFilters = () => {
    updateLevels([]);
    updateBreadths([]);
    updateUniversityRequirement(null);
    updateUnits([0, 5]);
    setDaysArray([...defaultDaysState]);
  };

  return (
    <div
      className={classNames(styles.root, {
        [styles.responsive]: responsive,
      })}
    >
      <Header />
      <div className={styles.body}>
        <div className={styles.filtersHeader}>
          <p className={styles.filtersTitle}>Filters</p>
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClearFilters}
          >
            Clear
          </button>
        </div>
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
          >
            {isAscending ? (
              <SortUp width={16} height={16} />
            ) : (
              <SortDown width={16} height={16} />
            )}
          </IconButton>
        </div>
        {terms && terms.length > 0 && (
          <div className={styles.formControl}>
            <p className={styles.label}>Semester</p>
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
          </div>
        )}
        <div className={styles.formControl}>
          <p className={styles.label}>Requirements</p>
          <Select<RequirementSelection>
            multi
            value={selectedRequirements}
            placeholder="Filter by requirements"
            onChange={(v) => {
              if (!Array.isArray(v)) return;
              const nextBreadths = v
                .filter(
                  (option): option is Extract<RequirementSelection, { type: "breadth" }> =>
                    option.type === "breadth"
                )
                .map((option) => option.value);
              const nextUniversityRequirement =
                v.find(
                  (option): option is Extract<RequirementSelection, { type: "university" }> =>
                    option.type === "university"
                )?.value ?? null;

              updateBreadths(nextBreadths);
              updateUniversityRequirement(nextUniversityRequirement);
            }}
            options={requirementOptions}
          />
        </div>
        <div className={styles.formControl}>
          <p className={styles.label}>Class Level</p>
          <Select
            multi
            value={levels}
            placeholder="Select class levels"
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
        </div>
        <div className={styles.formControl}>
          <p className={styles.label}>Units</p>
          <Slider
            min={0}
            max={5}
            step={1}
            value={units}
            onValueChange={updateUnits}
            labels={["0", "1", "2", "3", "4", "5+"]}
          />
        </div>
        <div className={styles.formControl}>
          <p className={styles.label}>Date and Time</p>
          <DaySelect
            days={daysArray}
            updateDays={(v) => {
              setDaysArray([...v]);
            }}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
