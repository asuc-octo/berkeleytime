import { useEffect, useMemo, useState } from "react";

import classNames from "classnames";
import { Filter, Search, SortDown } from "iconoir-react";
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

import {
  EMPTY_DAYS,
  EnrollmentFilter,
  GradingFilter,
  Level,
  SortBy,
} from "@/components/ClassBrowser/browser";
import { sortByTermDescending } from "@/lib/classes";
import { Semester } from "@/lib/generated/graphql";
import ClassCardSkeleton from "@/components/ClassCard/Skeleton";

// eslint-disable-next-line css-modules/no-unused-class
import browserStyles from "../../components/ClassBrowser/ClassBrowser.module.scss";
// eslint-disable-next-line css-modules/no-unused-class
import filterStyles from "../../components/ClassBrowser/Filters/Filters.module.scss";
// eslint-disable-next-line css-modules/no-unused-class
import headerStyles from "../../components/ClassBrowser/Header/Header.module.scss";
// eslint-disable-next-line css-modules/no-unused-class
import listStyles from "../../components/ClassBrowser/List/List.module.scss";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./Catalog.module.scss";

const DESKTOP_BREAKPOINT = 992;

function useIsDesktop() {
  const [matches, setMatches] = useState(() => window.innerWidth > DESKTOP_BREAKPOINT);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(width > ${DESKTOP_BREAKPOINT}px)`);
    const handleChange = (e: MediaQueryListEvent) => setMatches(e.matches);

    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return matches;
}

type Term = { year: number; semester: Semester };

function FilterSkeleton({ terms, currentTerm, onClose }: { terms?: Term[]; currentTerm?: Term; onClose: () => void }) {
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
    <div className={classNames(filterStyles.root, filterStyles.responsive)}>
      {/* Header - hidden on desktop via CSS */}
      <div className={classNames(headerStyles.root, headerStyles.responsive)}>
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
        <Button className={headerStyles.filterButton} onClick={onClose}>
          <Filter />
          <span>Close Filters</span>
        </Button>
      </div>

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

        {/* Sort By — static */}
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

        {/* Class level — static */}
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

        {/* Requirements — needs network */}
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

        {/* Department — needs network */}
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

        {/* Units — static */}
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

        {/* Enrollment Status — static */}
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

        {/* Grading Option — static */}
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

        {/* Date and Time — static */}
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

function ListSkeleton({ onOpenFilters }: { onOpenFilters: () => void }) {
  return (
    <div className={listStyles.root}>
      <div className={listStyles.topSection}>
        {/* Header skeleton */}
        <div className={classNames(headerStyles.root, headerStyles.responsive)}>
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
          <Button className={headerStyles.filterButton} onClick={onOpenFilters}>
            <Filter />
            <span>Open Filters</span>
          </Button>
        </div>

      </div>

        <div className={listStyles.recentlyViewedSection}>
          <div className={listStyles.recentlyViewed}>
            <div className={listStyles.recentlyViewedList}>
              {[...Array(3)].map((_, i) => (
                <span
                  key={`recent-skeleton-${i}`}
                  className={listStyles.recentlyViewedTagButton}
                  style={{ cursor: "default" }}
                >
                  <span style={{ visibility: "hidden", fontSize: "var(--text-14)", lineHeight: 1 }}>{"XXXX 000"}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

      <div className={listStyles.catalogScroll} style={{ overflow: "hidden" }}>
        <div className={listStyles.skeletonContainer}>
          {[...Array(10)].map((_, i) => (
            <ClassCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CatalogSkeleton({ terms, currentTerm }: { terms?: Term[]; currentTerm?: Term } = {}) {
  const isDesktop = useIsDesktop();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.root}>
      {isDesktop ? (
        <div className={styles.panel}>
          <div className={classNames(browserStyles.root, browserStyles.responsive, { [browserStyles.expanded]: expanded })}>
            <FilterSkeleton terms={terms} currentTerm={currentTerm} onClose={() => setExpanded(false)} />
            <ListSkeleton onOpenFilters={() => setExpanded(true)} />
          </div>
        </div>
      ) : (
        <div className={styles.catalogDrawer}>
          <div className={classNames(browserStyles.root, browserStyles.responsive, { [browserStyles.expanded]: expanded })}>
            <FilterSkeleton terms={terms} currentTerm={currentTerm} onClose={() => setExpanded(false)} />
            <ListSkeleton onOpenFilters={() => setExpanded(true)} />
          </div>
        </div>
      )}

      {!isDesktop && <div className={styles.drawerTrigger} />}

      {/* Right panel - empty like when no class selected */}
      <Flex direction="column" flexGrow="1" className={styles.view} />
    </div>
  );
}
