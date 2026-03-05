import { useMemo, useState } from "react";

import classNames from "classnames";
import { Filter, FilterSolid, Search, SortDown } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  DaySelect,
  Flex,
  IconButton,
  Input,
  Select,
  Slider,
} from "@repo/theme";

import browserStyles from "@/components/ClassBrowser/ClassBrowser.module.scss";
import filterStyles from "@/components/ClassBrowser/Filters/Filters.module.scss";
import headerStyles from "@/components/ClassBrowser/Header/Header.module.scss";
import listStyles from "@/components/ClassBrowser/List/List.module.scss";
import {
  EMPTY_DAYS,
  EnrollmentFilter,
  GradingFilter,
  Level,
  SortBy,
} from "@/components/ClassBrowser/browser";
import ClassCardSkeleton from "@/components/ClassCard/Skeleton";
import { sortByTermDescending } from "@/lib/classes";
import { Semester } from "@/lib/generated/graphql";

import styles from "./Catalog.module.scss";
import useCatalogLayoutMode, {
  CatalogLayoutMode,
} from "./hooks/useCatalogLayoutMode";

type Term = { year: number; semester: Semester };

function SkeletonHeader({
  mode,
  expanded,
  onToggle,
}: {
  mode: CatalogLayoutMode;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={headerStyles.root}>
      <div className={headerStyles.group}>
        <label className={headerStyles.icon}>
          <Search />
        </label>
        <input
          className={headerStyles.input}
          type="text"
          disabled
          placeholder=""
        />
      </div>
      {mode !== "full" && (
        <Button className={headerStyles.filterButton} onClick={onToggle}>
          {expanded ? <FilterSolid /> : <Filter />}
          <span>{expanded ? "Close Filters" : "Open Filters"}</span>
        </Button>
      )}
    </div>
  );
}

function FilterSkeleton({
  terms,
  currentTerm,
}: {
  terms?: Term[];
  currentTerm?: Term;
}) {
  const navigate = useNavigate();

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

  const currentTermLabel = currentTerm
    ? `${currentTerm.semester} ${currentTerm.year}`
    : null;

  return (
    <div className={filterStyles.root}>
      <div className={filterStyles.body}>
        <div className={filterStyles.filtersHeader}>
          <p className={filterStyles.filtersTitle}>Filters</p>
        </div>

        {/* Semester */}
        <div className={filterStyles.formControl}>
          <p className={filterStyles.label}>Semester</p>
          <Select
            searchable
            disabled={!terms}
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

        {/* Sort By */}
        <div className={filterStyles.formControl}>
          <p className={filterStyles.label}>Sort By</p>
          <div className={filterStyles.sortControls}>
            <Select
              disabled
              value={SortBy.Relevance}
              onChange={() => {}}
              options={Object.values(SortBy).map((s) => ({
                value: s,
                label: s,
              }))}
            />
            <IconButton
              className={filterStyles.sortToggleButton}
              disabled
              aria-label="Switch to descending order"
            >
              <SortDown width={16} height={16} />
            </IconButton>
          </div>
        </div>

        {/* Class level */}
        <div className={filterStyles.formControl}>
          <p className={filterStyles.label}>Class level</p>
          <Select
            multi
            disabled
            value={[]}
            placeholder="Select class levels"
            onChange={() => {}}
            options={Object.values(Level).map((level) => ({
              value: level,
              label: level,
            }))}
          />
        </div>

        {/* Requirements */}
        <div className={filterStyles.formControl}>
          <p className={filterStyles.label}>Requirements</p>
          <Select
            searchable
            disabled
            value={null}
            placeholder="Filter by requirements"
            onChange={() => {}}
            options={[]}
            searchPlaceholder="Search requirements..."
            emptyMessage="No requirements found."
          />
        </div>

        {/* Department */}
        <div className={filterStyles.formControl}>
          <p className={filterStyles.label}>Department</p>
          <Select
            searchable
            disabled
            value={null}
            placeholder="Select a department"
            onChange={() => {}}
            options={[]}
            searchPlaceholder="Search departments..."
            emptyMessage="No departments found."
          />
        </div>

        {/* Units */}
        <div className={filterStyles.formControl}>
          <p className={filterStyles.label}>Units</p>
          <Slider
            min={0}
            max={5}
            step={1}
            disabled
            value={[0, 5]}
            onValueChange={() => {}}
            labels={["0", "1", "2", "3", "4", "5+"]}
          />
        </div>

        {/* Enrollment Status */}
        <div className={filterStyles.formControl}>
          <p className={filterStyles.label}>Enrollment Status</p>
          <Select
            disabled
            value={null}
            placeholder="Select enrollment status"
            onChange={() => {}}
            options={Object.values(EnrollmentFilter).map((f) => ({
              value: f,
              label: f,
            }))}
          />
        </div>

        {/* Grading Option */}
        <div className={filterStyles.formControl}>
          <p className={filterStyles.label}>Grading Option</p>
          <Select<GradingFilter>
            multi
            disabled
            value={[]}
            placeholder="Filter by grading options"
            onChange={() => {}}
            options={Object.values(GradingFilter).map((g) => ({
              value: g,
              label: g,
            }))}
          />
        </div>

        {/* Date and Time */}
        <div className={filterStyles.formControl}>
          <p className={filterStyles.label}>Date and Time</p>
          <DaySelect days={EMPTY_DAYS} updateDays={() => {}} size="sm" />
          <div className={filterStyles.timeRangeInputs}>
            <div className={filterStyles.timeInputGroup}>
              <label className={filterStyles.timeLabel}>From</label>
              <Input
                type="time"
                disabled
                value=""
                onChange={() => {}}
                className={filterStyles.timeInput}
              />
            </div>
            <div className={filterStyles.timeInputGroup}>
              <label className={filterStyles.timeLabel}>To</label>
              <Input
                type="time"
                disabled
                value=""
                onChange={() => {}}
                className={filterStyles.timeInput}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CatalogSkeleton({
  terms,
  currentTerm,
}: { terms?: Term[]; currentTerm?: Term } = {}) {
  const mode = useCatalogLayoutMode();
  const isDesktop = mode !== "compact";
  const [expanded, setExpanded] = useState(false);

  const browserContent = (
    <div
      className={classNames(browserStyles.root, {
        [browserStyles.expanded]: expanded,
      })}
      data-mode={mode}
    >
      <FilterSkeleton terms={terms} currentTerm={currentTerm} />
      <div className={listStyles.root}>
        <div className={listStyles.topSection}>
          <SkeletonHeader
            mode={mode}
            expanded={expanded}
            onToggle={() => setExpanded((e) => !e)}
          />
        </div>
        <div
          className={listStyles.catalogScroll}
          style={{ overflow: "hidden" }}
        >
          <div className={listStyles.skeletonContainer}>
            {[...Array(10)].map((_, i) => (
              <ClassCardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.root}>
      {isDesktop ? (
        <div className={styles.panel}>{browserContent}</div>
      ) : (
        <div className={styles.catalogDrawer}>{browserContent}</div>
      )}

      {!isDesktop && <div className={styles.drawerTrigger} />}

      <Flex direction="column" flexGrow="1" className={styles.view} />
    </div>
  );
}
