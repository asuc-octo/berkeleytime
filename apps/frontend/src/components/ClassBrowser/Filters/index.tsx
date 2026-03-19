import { useEffect, useMemo, useState } from "react";

import { SortDown, SortUp } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import { DaySelect, IconButton, Input, Select, Slider } from "@repo/theme";
import type { Option, SelectTab } from "@repo/theme";

import { sortByTermDescending } from "@/lib/classes";

import {
  Day,
  EMPTY_DAYS,
  EnrollmentFilter,
  GradingFilter,
  Level,
  SortBy,
} from "../browser";
import { useFilterContext } from "../context/FilterContext";
import styles from "./Filters.module.scss";

type RequirementSelection =
  | { type: "breadth"; value: string }
  | { type: "university"; value: string };

const REQUIREMENT_TABS = {
  LS: "ls",
  UNIVERSITY: "university",
} as const;

export default function Filters() {
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
    gradingFilters,
    updateGradingFilters,
    enrollmentFilter,
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
  } = useFilterContext();

  const navigate = useNavigate();

  const [daysArray, setDaysArray] = useState<boolean[]>(() => [...EMPTY_DAYS]);
  const [activeRequirementTab, setActiveRequirementTab] = useState<string>(
    REQUIREMENT_TABS.LS
  );

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

  const breadthRequirementOptions = useMemo<Option<RequirementSelection>[]>(
    () =>
      (filterOptions?.breadthRequirements ?? []).map((breadth) => ({
        value: { type: "breadth", value: breadth } as RequirementSelection,
        label: breadth,
      })),
    [filterOptions]
  );

  const universityRequirementOptions = useMemo<Option<RequirementSelection>[]>(
    () =>
      (filterOptions?.universityRequirements ?? []).map((requirement) => ({
        value: {
          type: "university",
          value: requirement,
        } as RequirementSelection,
        label: requirement,
      })),
    [filterOptions]
  );

  const requirementTabs = useMemo<SelectTab<RequirementSelection>[]>(() => {
    const tabs: SelectTab<RequirementSelection>[] = [];

    if (breadthRequirementOptions.length > 0) {
      tabs.push({
        value: REQUIREMENT_TABS.LS,
        label: "L&S",
        options: breadthRequirementOptions,
      });
    }

    if (universityRequirementOptions.length > 0) {
      tabs.push({
        value: REQUIREMENT_TABS.UNIVERSITY,
        label: "University",
        options: universityRequirementOptions,
      });
    }

    return tabs;
  }, [breadthRequirementOptions, universityRequirementOptions]);
  const requirementSelectTabs =
    requirementTabs.length > 0 ? requirementTabs : undefined;

  const selectedRequirement = useMemo<RequirementSelection | null>(() => {
    if (breadths.length > 0) {
      return { type: "breadth", value: breadths[0] };
    }
    if (universityRequirements.length > 0) {
      return { type: "university", value: universityRequirements[0] };
    }
    return null;
  }, [breadths, universityRequirements]);

  useEffect(() => {
    if (selectedRequirement?.type === "breadth") {
      setActiveRequirementTab(REQUIREMENT_TABS.LS);
      return;
    }
    if (selectedRequirement?.type === "university") {
      setActiveRequirementTab(REQUIREMENT_TABS.UNIVERSITY);
    }
  }, [selectedRequirement]);

  useEffect(() => {
    if (!requirementSelectTabs?.length) return;
    const hasActiveTab = requirementSelectTabs.some(
      (tab) => tab.value === activeRequirementTab
    );
    if (!hasActiveTab) {
      setActiveRequirementTab(requirementSelectTabs[0].value);
    }
  }, [activeRequirementTab, requirementSelectTabs]);

  const gradingOptions = useMemo<Option<GradingFilter>[]>(() => {
    return Object.values(GradingFilter).map((category) => ({
      value: category,
      label: category,
    }));
  }, []);

  const isClassLevelDisabled = Object.values(filteredLevels).every(
    (count) => count === 0
  );
  const isGradingDisabled =
    !filterOptions || filterOptions.gradingOptions.length === 0;

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
    updateUnits([0, 5]);
    setDaysArray([...EMPTY_DAYS]);
    updateDays([]);
    updateTimeRange([null, null]);
    updateSortBy(SortBy.Relevance);
    updateEnrollmentFilter(null);
  };

  return (
    <div className={styles.root}>
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
        <div className={styles.formControl}>
          <p className={styles.label}>Semester</p>
          <Select
            searchable
            disabled={!terms || terms.length === 0}
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
            searchPlaceholder="Search semesters..."
            emptyMessage="No semesters found."
            maxListHeight={130}
          />
        </div>
        <div className={styles.formControl}>
          <p className={styles.label}>Sort By</p>
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
        </div>
        <div className={styles.formControl}>
          <p className={styles.label}>Class level</p>
          <Select
            multi
            value={levels}
            placeholder="Select class levels"
            disabled={isClassLevelDisabled}
            onChange={(v) => {
              if (Array.isArray(v)) updateLevels(v);
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
          <p className={styles.label}>Requirements</p>
          <Select<RequirementSelection>
            searchable
            clearable
            value={selectedRequirement}
            placeholder="Filter by requirements"
            tabs={requirementSelectTabs}
            defaultTab={requirementSelectTabs?.[0]?.value}
            tabValue={activeRequirementTab}
            onTabChange={(tabValue) => {
              setActiveRequirementTab(tabValue);
            }}
            onChange={(value) => {
              if (value === null) {
                updateBreadths([]);
                updateUniversityRequirements([]);
                return;
              }
              if (Array.isArray(value)) return;
              if (value.type === "breadth") {
                updateBreadths([value.value]);
                updateUniversityRequirements([]);
                return;
              }
              updateUniversityRequirements([value.value]);
              updateBreadths([]);
            }}
            searchPlaceholder="Search requirements..."
            emptyMessage="No requirements found."
            contentClassName={styles.requirementsSelectContent}
            tabsWrapperClassName={styles.requirementsTabs}
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
          <p className={styles.label}>Enrollment Status</p>
          <Select
            value={enrollmentFilter}
            placeholder="Select enrollment status"
            clearable
            onChange={(value) =>
              updateEnrollmentFilter(value as EnrollmentFilter | null)
            }
            options={Object.values(EnrollmentFilter).map((filter) => ({
              value: filter,
              label: filter,
            }))}
          />
        </div>
        <div className={styles.formControl}>
          <p className={styles.label}>Grading Option</p>
          <Select<GradingFilter>
            multi
            value={gradingFilters}
            placeholder="Filter by grading options"
            disabled={isGradingDisabled}
            onChange={(v) => {
              if (Array.isArray(v)) updateGradingFilters(v);
            }}
            options={gradingOptions}
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
          <div className={styles.timeRangeInputs}>
            <div className={styles.timeInputGroup}>
              <label htmlFor="time-from" className={styles.timeLabel}>
                From
              </label>
              <Input
                type="time"
                id="time-from"
                value={timeRange[0] ?? ""}
                min={filterOptions?.timeRange?.minStartTime}
                max={filterOptions?.timeRange?.maxEndTime}
                onChange={(e) => {
                  const value = e.target.value || null;
                  updateTimeRange([value, timeRange[1]]);
                }}
                className={styles.timeInput}
              />
            </div>
            <div className={styles.timeInputGroup}>
              <label htmlFor="time-to" className={styles.timeLabel}>
                To
              </label>
              <Input
                type="time"
                id="time-to"
                value={timeRange[1] ?? ""}
                min={filterOptions?.timeRange?.minStartTime}
                max={filterOptions?.timeRange?.maxEndTime}
                onChange={(e) => {
                  const value = e.target.value || null;
                  updateTimeRange([timeRange[0], value]);
                }}
                className={styles.timeInput}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
