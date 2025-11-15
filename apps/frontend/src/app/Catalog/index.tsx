import { useCallback, useEffect, useMemo, useState } from "react";

import classNames from "classnames";
import { NavArrowRight, Xmark } from "iconoir-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Dialog, Flex, IconButton } from "@repo/theme";

import Class from "@/components/Class";
import ClassBrowser from "@/components/ClassBrowser";
import { useReadTerms } from "@/hooks/api";
import { useReadClass } from "@/hooks/api/classes/useReadClass";
import { Semester } from "@/lib/generated/graphql";
import { RecentType, addRecent, getRecents } from "@/lib/recent";

import styles from "./Catalog.module.scss";

// Semester hierarchy for chronological ordering (latest to earliest in year)
const SEMESTER_ORDER: Record<Semester, number> = {
  [Semester.Spring]: 0,
  [Semester.Summer]: 1,
  [Semester.Fall]: 2,
  [Semester.Winter]: 3,
};

export default function Catalog() {
  const {
    year: providedYear,
    semester: providedSemester,
    subject: providedSubject,
    courseNumber,
    number,
  } = useParams();

  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [catalogDrawerOpen, setCatalogDrawerOpen] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  const { data: terms, loading: termsLoading } = useReadTerms();

  const semester = useMemo(() => {
    if (!providedSemester) return null;

    return providedSemester[0].toUpperCase() + providedSemester.slice(1);
  }, [providedSemester]);

  const year = useMemo(() => {
    if (!providedYear) return null;

    return parseInt(providedYear) || null;
  }, [providedYear]);

  const term = useMemo(() => {
    if (!terms) return null;

    const recentTerm = getRecents(RecentType.CatalogTerm)[0];

    // Default to the latest term by year + semester hierarchy
    const latestTerm = terms.toSorted((a, b) => {
      // Sort by year DESC first
      if (a.year !== b.year) return b.year - a.year;
      // Then by semester hierarchy DESC
      return SEMESTER_ORDER[b.semester] - SEMESTER_ORDER[a.semester];
    })[0];

    const selectedTerm =
      terms?.find((term) => term.year === year && term.semester === semester) ??
      terms.find(
        (term) =>
          term.year === recentTerm?.year &&
          term.semester === recentTerm?.semester
      ) ??
      latestTerm;

    if (selectedTerm) {
      addRecent(RecentType.CatalogTerm, {
        year: selectedTerm.year,
        semester: selectedTerm.semester,
      });
    }

    return selectedTerm;
  }, [terms, year, semester]);

  const subject = useMemo(
    () => providedSubject?.toUpperCase(),
    [providedSubject]
  );

  const { data: _class, loading: classLoading } = useReadClass(
    term?.year as number,
    term?.semester,
    subject as string,
    courseNumber as string,
    number as string,
    {
      skip: !subject || !courseNumber || !number || !term,
    }
  );

  // Course data is already included in _class via the backend resolver
  const _course = _class?.course;

  const handleSelect = useCallback(
    (subject: string, courseNumber: string, number: string) => {
      if (!term) return;

      setOpen(true);
      setCatalogDrawerOpen(false); // Close drawer when selecting a class

      navigate({
        ...location,
        pathname: `/catalog/${term.year}/${term.semester}/${subject}/${courseNumber}/${number}`,
      });
    },
    [navigate, location, term]
  );

  // Handle mouse movement for floating button on mobile
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Only show on mobile
      if (window.innerWidth > 992) {
        setShowFloatingButton(false);
        return;
      }

      // Expand button when cursor is within 60px of left edge (covers peeking button)
      setShowFloatingButton(e.clientX < 60);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (termsLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingHeader} />
        <div className={styles.loadingBody} />
      </div>
    );
  }

  // TODO: Error state
  if (!terms || !term) {
    return <></>;
  }

  // TODO: Class error state, class loading state
  return (
    <div
      className={classNames(styles.root, {
        [styles.open]: open,
      })}
    >
      {/* Desktop: Static panel */}
      <div className={styles.panel}>
        <div className={styles.header}>
          <p className={styles.title}>
            {term.semester} {term.year}
          </p>
          <IconButton onClick={() => setOpen(true)}>
            <Xmark />
          </IconButton>
        </div>
        <div className={styles.body}>
          <ClassBrowser
            onSelect={handleSelect}
            semester={term.semester}
            year={term.year}
            terms={terms}
            persistent
          />
        </div>
      </div>

      {/* Mobile: Drawer overlay */}
      <Dialog.Root open={catalogDrawerOpen} onOpenChange={setCatalogDrawerOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Drawer align="start" className={styles.catalogDrawer}>
            <ClassBrowser
              onSelect={handleSelect}
              semester={term.semester}
              year={term.year}
              terms={terms}
              persistent
            />
          </Dialog.Drawer>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Floating button to open catalog on mobile */}
      <button
        className={classNames(styles.floatingButton, {
          [styles.visible]: showFloatingButton,
        })}
        onClick={() => setCatalogDrawerOpen(true)}
        aria-label="Open catalog"
      >
        <NavArrowRight />
      </button>

      <Flex direction="column" flexGrow="1" className={styles.view}>
        {classLoading ? (
          <div className={styles.loading}>
            <div className={styles.loadingHeader} />
            <div className={styles.loadingBody} />
          </div>
        ) : _class && _course ? (
          <Class
            class={_class}
            course={_course}
            onClose={() => setOpen(false)}
          />
        ) : null}
      </Flex>
    </div>
  );
}
