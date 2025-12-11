import { useEffect, useMemo, useState } from "react";

import classNames from "classnames";
import { SortDown, SortUp } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import { DaySelect, IconButton, Input, Select, Slider } from "@repo/theme";
import type { Option, OptionItem } from "@repo/theme";

import { sortByTermDescending } from "@/lib/classes";
import { ClassGradingBasis } from "@/lib/generated/graphql";

import Header from "../Header";
import {
  Breadth,
  Day,
  GradingFilter,
  Level,
  SortBy,
  UniversityRequirement,
  getAllBreadthRequirements,
  getAllUniversityRequirements,
  getBreadthRequirements,
  getFilteredClasses,
  getLevel,
  getUniversityRequirements,
  gradingBasisCategoryMap,
} from "../browser";
import useBrowser from "../useBrowser";
import styles from "./Filters.module.scss";

// TODO: Add Mode of Instruction

// TODO: Add requirements from relevant sources

type RequirementSelection =
  | { type: "breadth"; value: Breadth }
  | { type: "university"; value: UniversityRequirement };

const EMPTY_DAYS: boolean[] = [false, false, false, false, false, false, false];

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
    timeRange,
    updateTimeRange,
    breadths,
    updateBreadths,
    universityRequirement,
    updateUniversityRequirement,
    gradingFilters,
    updateGradingFilters,
    academicOrganization,
    updateAcademicOrganization,
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

  const [daysArray, setDaysArray] = useState<boolean[]>(() => [...EMPTY_DAYS]);

  useEffect(() => {
    const newDays = daysArray.reduce((acc, v, i) => {
      if (v) acc.push(i.toString() as Day);
      return acc;
    }, [] as Day[]);
    updateDays(newDays);
  }, [daysArray]);

  const allClasses = useMemo(
    () => [...includedClasses, ...excludedClasses],
    [includedClasses, excludedClasses]
  );

  const classesForLevelCounts = useMemo(() => {
    if (levels.length === 0) {
      return includedClasses;
    }

    return getFilteredClasses(
      allClasses,
      units,
      [],
      days,
      open,
      online,
      breadths,
      universityRequirement,
      gradingFilters,
      academicOrganization,
      timeRange
    ).includedClasses;
  }, [
    allClasses,
    includedClasses,
    levels,
    units,
    days,
    open,
    online,
    breadths,
    universityRequirement,
    gradingFilters,
    academicOrganization,
    timeRange,
  ]);

  const filteredLevels = useMemo(() => {
    return classesForLevelCounts.reduce(
      (acc, _class) => {
        const level = getLevel(
          _class.course.academicCareer,
          _class.courseNumber
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
  }, [classesForLevelCounts]);

  const classesWithoutAcademicOrganization = useMemo(
    () =>
      getFilteredClasses(
        allClasses,
        units,
        levels,
        days,
        open,
        online,
        breadths,
        universityRequirement,
        gradingFilters,
        null,
        timeRange
      ).includedClasses,
    [
      allClasses,
      units,
      levels,
      days,
      open,
      online,
      breadths,
      universityRequirement,
      gradingFilters,
      timeRange,
    ]
  );

  const academicOrganizationCounts = useMemo(() => {
    const counts = new Map<string, number>();
    classesWithoutAcademicOrganization.forEach((_class) => {
      const org = _class.course.academicOrganization;
      if (!org) return;
      counts.set(org, (counts.get(org) ?? 0) + 1);
    });
    return counts;
  }, [classesWithoutAcademicOrganization]);

  const classesWithoutRequirements = useMemo(
    () =>
      getFilteredClasses(
        allClasses,
        units,
        levels,
        days,
        open,
        online,
        [],
        null,
        gradingFilters,
        academicOrganization,
        timeRange
      ).includedClasses,
    [
      allClasses,
      units,
      levels,
      days,
      open,
      online,
      gradingFilters,
      academicOrganization,
      timeRange,
    ]
  );

  const breadthCounts = useMemo(() => {
    const counts = new Map<Breadth, number>();
    classesWithoutRequirements.forEach((_class) => {
      const breadthList = getBreadthRequirements(
        _class.primarySection?.sectionAttributes ?? []
      );
      breadthList.forEach((breadth) => {
        counts.set(breadth, (counts.get(breadth) ?? 0) + 1);
      });
    });
    return counts;
  }, [classesWithoutRequirements]);

  const universityRequirementCounts = useMemo(() => {
    const counts = new Map<UniversityRequirement, number>();
    classesWithoutRequirements.forEach((_class) => {
      const requirements = getUniversityRequirements(
        _class.requirementDesignation
      );
      requirements.forEach((requirement) => {
        counts.set(requirement, (counts.get(requirement) ?? 0) + 1);
      });
    });
    return counts;
  }, [classesWithoutRequirements]);

  const classesWithoutGrading = useMemo(
    () =>
      getFilteredClasses(
        allClasses,
        units,
        levels,
        days,
        open,
        online,
        breadths,
        universityRequirement,
        [],
        academicOrganization,
        timeRange
      ).includedClasses,
    [
      allClasses,
      units,
      levels,
      days,
      open,
      online,
      breadths,
      universityRequirement,
      academicOrganization,
      timeRange,
    ]
  );

  const gradingCounts = useMemo<Record<GradingFilter, number>>(() => {
    return classesWithoutGrading.reduce<Record<GradingFilter, number>>(
      (acc, _class) => {
        const basis = (_class.gradingBasis ?? "") as ClassGradingBasis;
        const category = gradingBasisCategoryMap[basis] ?? GradingFilter.Other;
        acc[category] += 1;
        return acc;
      },
      {
        [GradingFilter.Graded]: 0,
        [GradingFilter.PassNoPass]: 0,
        [GradingFilter.Other]: 0,
      }
    );
  }, [classesWithoutGrading]);

  const filteredBreadths = useMemo(() => {
    return getAllBreadthRequirements(allClasses);
  }, [allClasses]);

  const filteredUniversityRequirements = useMemo(() => {
    return getAllUniversityRequirements(allClasses);
  }, [allClasses]);

  const requirementOptions = useMemo<Option<RequirementSelection>[]>(() => {
    const options: Option<RequirementSelection>[] = [];

    if (filteredBreadths.length > 0) {
      options.push({ type: "label", label: "L&S REQUIREMENTS" });
      options.push(
        ...filteredBreadths.map((breadth) => ({
          value: { type: "breadth", value: breadth } as RequirementSelection,
          label: breadth,
          meta: (breadthCounts.get(breadth) ?? 0).toString(),
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
          meta: (universityRequirementCounts.get(requirement) ?? 0).toString(),
        }))
      );
    }

    return options;
  }, [
    filteredBreadths,
    filteredUniversityRequirements,
    breadthCounts,
    universityRequirementCounts,
  ]);
  const selectedRequirements = useMemo<RequirementSelection[]>(
    () => [
      ...breadths.map(
        (breadth) => ({ type: "breadth", value: breadth }) as const
      ),
      ...(universityRequirement
        ? [{ type: "university" as const, value: universityRequirement }]
        : []),
    ],
    [breadths, universityRequirement]
  );

  const gradingOptions = useMemo<Option<GradingFilter>[]>(() => {
    return Object.values(GradingFilter).map((category) => ({
      value: category,
      label: category,
      meta: (gradingCounts[category] ?? 0).toString(),
    }));
  }, [gradingCounts]);

  const academicOrganizationData = useMemo(() => {
    const orgMap = new Map<string, { name: string; nicknames: Set<string> }>();

    classesWithoutAcademicOrganization.forEach((_class) => {
      const org = _class.course.academicOrganization;
      const orgName = _class.course.academicOrganizationName;
      const nicknames = _class.course.departmentNicknames;

      if (!org || !orgName) return;

      const nicknameList =
        nicknames
          ?.split("!")
          .map((n) => n.trim())
          .filter(Boolean) ?? [];

      const existing = orgMap.get(org);
      if (!existing) {
        orgMap.set(org, {
          name: orgName,
          nicknames: new Set(nicknameList),
        });
        return;
      }

      nicknameList.forEach((nickname) => existing.nicknames.add(nickname));
    });

    return new Map(
      Array.from(orgMap.entries()).map(([code, data]) => [
        code,
        {
          name: data.name,
          nicknames: data.nicknames.size ? Array.from(data.nicknames) : null,
        },
      ])
    );
  }, [classesWithoutAcademicOrganization]);

  const academicOrganizationOptions = useMemo<OptionItem<string>[]>(() => {
    const options = Array.from(academicOrganizationData.entries()).map(
      ([code, data]) => ({
        value: code,
        label: data.name,
        meta: (academicOrganizationCounts.get(code) ?? 0).toString(),
        type: "option" as const,
      })
    );

    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [academicOrganizationData, academicOrganizationCounts]);

  const departmentSearchFunction = (
    query: string,
    options: Option<string>[]
  ) => {
    if (!query || query.trim() === "") return options;

    const searchLower = query.toLowerCase();
    return options.filter((opt) => {
      if (opt.type === "label") return true;

      const orgData = academicOrganizationData.get(opt.value);
      if (!orgData) return false;

      // Search in department name
      if (orgData.name.toLowerCase().includes(searchLower)) return true;

      // Search in nicknames
      if (orgData.nicknames) {
        return orgData.nicknames.some((nickname) =>
          nickname.toLowerCase().includes(searchLower)
        );
      }

      return false;
    });
  };

  // Disable filters when all options have count 0
  const isAcademicOrganizationDisabled = useMemo(
    () =>
      academicOrganizationOptions.length === 0 ||
      academicOrganizationOptions.every((opt) => opt.meta === "0" || !opt.meta),
    [academicOrganizationOptions]
  );

  const isClassLevelDisabled = useMemo(
    () => Object.values(filteredLevels).every((count) => count === 0),
    [filteredLevels]
  );

  const isGradingDisabled = useMemo(
    () => Object.values(gradingCounts).every((count) => count === 0),
    [gradingCounts]
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
    updateUniversityRequirement(null);
    updateGradingFilters([]);
    updateAcademicOrganization(null);
    updateUnits([0, 5]);
    setDaysArray([...EMPTY_DAYS]);
    updateDays([]);
    updateTimeRange([null, null]);
    updateSortBy(SortBy.Relevance);
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
        {terms && terms.length > 0 && (
          <div className={styles.formControl}>
            <p className={styles.label}>Semester</p>
            <Select
              searchable
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
            />
          </div>
        )}
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
          <p className={styles.label}>Department</p>
          <Select<string>
            searchable
            value={academicOrganization}
            placeholder="Select a department"
            clearable
            disabled={isAcademicOrganizationDisabled}
            onChange={(value) => {
              if (typeof value === "string" || value === null) {
                updateAcademicOrganization(value);
              }
            }}
            options={academicOrganizationOptions}
            searchPlaceholder="Search departments..."
            emptyMessage="No departments found."
            customSearch={departmentSearchFunction}
          />
        </div>
        <div className={styles.formControl}>
          <p className={styles.label}>Requirements</p>
          <Select<RequirementSelection>
            searchable
            multi
            value={selectedRequirements}
            placeholder="Filter by requirements"
            disabled={false}
            onChange={(v) => {
              if (!Array.isArray(v)) return;
              const nextBreadths = v
                .filter(
                  (
                    option
                  ): option is Extract<
                    RequirementSelection,
                    { type: "breadth" }
                  > => option.type === "breadth"
                )
                .map((option) => option.value);
              const nextUniversityRequirement =
                v.find(
                  (
                    option
                  ): option is Extract<
                    RequirementSelection,
                    { type: "university" }
                  > => option.type === "university"
                )?.value ?? null;

              updateBreadths(nextBreadths);
              updateUniversityRequirement(nextUniversityRequirement);
            }}
            options={requirementOptions}
            searchPlaceholder="Search requirements..."
            emptyMessage="No requirements found."
          />
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
          <div className={styles.timeRangeInputs}>
            <div className={styles.timeInputGroup}>
              <label htmlFor="time-from" className={styles.timeLabel}>
                From
              </label>
              <Input
                type="time"
                id="time-from"
                value={timeRange[0] ?? ""}
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
                onChange={(e) => {
                  const value = e.target.value || null;
                  updateTimeRange([timeRange[0], value]);
                }}
                className={styles.timeInput}
              />
            </div>
          </div>
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
      </div>
    </div>
  );
}
