import { useEffect, useMemo, useState } from "react";

import { Filter, SortDown, SortUp } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import { Button, DaySelect, IconButton, Select, Slider } from "@repo/theme";
import type { Option } from "@repo/theme";

import { sortByTermDescending } from "@/lib/classes";

import { Day, EMPTY_DAYS, Level, SortBy } from "../browser";
import { useFilterContext } from "../context/FilterContext";
import { useLayoutContext } from "../context/LayoutContext";
import styles from "./Filters.module.scss";

type RequirementSelection =
  | { type: "breadth"; value: string }
  | { type: "university"; value: string };

const TIME_LABELS = [
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
  "9:00 PM",
] as const;

const to24HourTime = (label: (typeof TIME_LABELS)[number]) => {
  const [time, period] = label.split(" ");
  const [hourText, minute] = time.split(":");
  let hour = Number(hourText);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${minute}`;
};

const TIME_OPTIONS = TIME_LABELS.map((label) => ({
  label,
  value: to24HourTime(label),
}));

const SORT_OPTION_LABELS: Record<SortBy, string> = {
  [SortBy.Relevance]: "Relevance",
  [SortBy.Units]: "Units",
  [SortBy.AverageGrade]: "Average Grade",
  [SortBy.OpenSeats]: "Open Seats",
};

export default function Filters() {
  const { mode, setExpanded } = useLayoutContext();

  const {
    units,
    updateUnits,
    levels,
    updateLevels,
    updateDays,
    timeRange,
    updateTimeRange,
    breadths,
    updateBreadths,
    universityRequirements,
    updateUniversityRequirements,
    updateGradingFilters,
    department,
    updateDepartment,
    updateEnrollmentFilter,
    sortBy,
    reverse,
    effectiveOrder,
    updateSortBy,
    updateReverse,
    year,
    semester,
    terms,
    filterOptions,
    updateScheduleConflictFilter,
  } = useFilterContext();

  const navigate = useNavigate();

  const [daysArray, setDaysArray] = useState<boolean[]>(() => [...EMPTY_DAYS]);

  useEffect(() => {
    const newDays = daysArray.reduce((acc, v, i) => {
      if (v) acc.push(i.toString() as Day);
      return acc;
    }, [] as Day[]);
    updateDays(newDays);
  }, [daysArray]);

  // Use filter options from server
  const filteredLevels = useMemo(() => {
    const result: Record<Level, number> = {
      "Lower Division": 0,
      "Upper Division": 0,
      Graduate: 0,
      Extension: 0,
    };
    if (filterOptions) {
      for (const level of filterOptions.levels) {
        if (level in result) {
          result[level as Level] = 1;
        }
      }
    }
    return result;
  }, [filterOptions]);

  const requirementOptions = useMemo<Option<RequirementSelection>[]>(() => {
    const options: Option<RequirementSelection>[] = [];
    const university = filterOptions?.universityRequirements ?? [];
    const breadths = filterOptions?.breadthRequirements ?? [];

    if (university.length > 0) {
      options.push({ type: "label", label: "University Requirements" });
      options.push(
        ...university.map((requirement) => ({
          value: { type: "university" as const, value: requirement },
          label: requirement,
        }))
      );
    }

    if (breadths.length > 0) {
      options.push({ type: "label", label: "L&S Breadth" });
      options.push(
        ...breadths.map((breadth) => ({
          value: { type: "breadth" as const, value: breadth },
          label: breadth,
        }))
      );
    }

    return options;
  }, [filterOptions]);

  const selectedRequirements = useMemo<RequirementSelection[]>(
    () => [
      ...universityRequirements.map((value) => ({
        type: "university" as const,
        value,
      })),
      ...breadths.map((value) => ({ type: "breadth" as const, value })),
    ],
    [breadths, universityRequirements]
  );

  const departmentOptions = useMemo(
    () =>
      (filterOptions?.departments ?? []).map((option) => ({
        value: option.code,
        label: option.name,
      })),
    [filterOptions]
  );

  const isClassLevelDisabled = Object.values(filteredLevels).every(
    (count) => count === 0
  );

  const isAscending = effectiveOrder === "asc";
  const nextOrderLabel = isAscending ? "descending" : "ascending";

  const availableTerms = useMemo(() => {
    if (!terms) return [];
    return [...terms]
      .filter(
        ({ year, semester }, index) =>
          index ===
          terms.findIndex(
            (term) => term.semester === semester && term.year === year
          )
      )
      .sort(sortByTermDescending);
  }, [terms]);

  const currentTermLabel = `${semester} ${year}`;

  const handleClearFilters = () => {
    updateLevels([]);
    updateBreadths([]);
    updateUniversityRequirements([]);
    updateGradingFilters([]);
    updateDepartment(null);
    updateUnits([0, 5]);
    setDaysArray([...EMPTY_DAYS]);
    updateDays([]);
    updateTimeRange([null, null]);
    updateSortBy(SortBy.Relevance);
    updateEnrollmentFilter(null);
    updateScheduleConflictFilter(null);
  };

  return (
    <div className={styles.root}>
      <div className={styles.body}>
        <div className={styles.filtersHeader}>
          <p className={styles.filtersTitle}>Filters</p>
          <Button
            type="button"
            variant="tertiary"
            noFill
            onClick={handleClearFilters}
          >
            Clear
          </Button>
        </div>
        {mode !== "full" && (
          <Button
            className={styles.closeFiltersButton}
            onClick={() => setExpanded(false)}
          >
            <Filter />
            <span>Close Filters</span>
          </Button>
        )}
        <div className={styles.sortControls}>
          <Select
            value={sortBy}
            selectedLabel={`Sort by ${SORT_OPTION_LABELS[sortBy]}`}
            onChange={(value) => {
              if (typeof value === "string") updateSortBy(value as SortBy);
            }}
            options={Object.values(SortBy).map((sortOption) => ({
              value: sortOption,
              label: SORT_OPTION_LABELS[sortOption],
            }))}
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
        <div className={styles.formControl}>
          <p className={styles.label}>Semester</p>
          <Select
            combobox
            disabled={!terms || terms.length === 0}
            value={currentTermLabel}
            placeholder="Select a semester"
            side="bottom"
            maxListHeight={280}
            onChange={(value) => {
              if (typeof value !== "string") return;
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
            emptyMessage="No semesters found."
          />
        </div>
        <div className={styles.formControl}>
          <p className={styles.label}>Department</p>
          <Select
            combobox
            clearable
            disabled={!filterOptions || departmentOptions.length === 0}
            value={department}
            placeholder="Select a department"
            side="bottom"
            maxListHeight={280}
            onChange={(value) => {
              if (Array.isArray(value)) return;
              updateDepartment(value);
            }}
            options={departmentOptions}
            emptyMessage="No departments found."
          />
        </div>
        <div className={styles.formControl}>
          <p className={styles.label}>Requirements</p>
          <Select<RequirementSelection>
            multi
            clearable
            value={selectedRequirements}
            placeholder="Filter by requirements"
            disabled={requirementOptions.length === 0}
            onChange={(value) => {
              if (value === null) {
                updateBreadths([]);
                updateUniversityRequirements([]);
                return;
              }
              if (!Array.isArray(value)) return;
              updateBreadths(
                value
                  .filter((requirement) => requirement.type === "breadth")
                  .map((requirement) => requirement.value)
              );
              updateUniversityRequirements(
                value
                  .filter((requirement) => requirement.type === "university")
                  .map((requirement) => requirement.value)
              );
            }}
            options={requirementOptions}
            emptyMessage="No requirements found."
          />
        </div>
        <div className={styles.formControl}>
          <p className={styles.label}>Class Level</p>
          <Select
            multi
            clearable
            value={levels}
            placeholder="Select class levels"
            disabled={isClassLevelDisabled}
            onChange={(v) => {
              if (v === null) updateLevels([]);
              else if (Array.isArray(v)) updateLevels(v);
            }}
            options={Object.values(Level).map((level) => {
              return {
                value: level,
                label: level,
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
          <p className={styles.label}>Day and Time</p>
          <DaySelect
            days={daysArray}
            updateDays={(v) => {
              setDaysArray([...v]);
            }}
            size="sm"
          />
          <div className={styles.timeRangeInputs}>
            <div className={styles.timeField}>
              <Select
                clearable
                value={timeRange[0]}
                placeholder="Start"
                dense
                style={{ width: "100%", paddingLeft: 10, paddingRight: 10 }}
                maxListHeight={200}
                contentClassName={styles.timeMenu}
                onChange={(value) => {
                  if (Array.isArray(value)) return;
                  updateTimeRange([value, timeRange[1]]);
                }}
                options={TIME_OPTIONS}
              />
            </div>
            <span className={styles.timeConnector}>to</span>
            <div className={styles.timeField}>
              <Select
                clearable
                value={timeRange[1]}
                placeholder="End"
                dense
                style={{ width: "100%", paddingLeft: 10, paddingRight: 10 }}
                maxListHeight={200}
                contentClassName={styles.timeMenu}
                onChange={(value) => {
                  if (Array.isArray(value)) return;
                  updateTimeRange([timeRange[0], value]);
                }}
                options={TIME_OPTIONS}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
