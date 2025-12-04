import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { NavArrowRight } from "iconoir-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Flex } from "@repo/theme";

import Class from "@/components/Class";
import ClassBrowser from "@/components/ClassBrowser";
import { useReadTerms } from "@/hooks/api";
import { useGetClass } from "@/hooks/api/classes/useGetClass";
import { Semester } from "@/lib/generated/graphql";
import { RecentType, addRecent, getRecents } from "@/lib/recent";

import styles from "./Catalog.module.scss";
import CatalogSkeleton from "./Skeleton";

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth > 992);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(width > 992px)");
    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isDesktop;
};

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

  const isDesktop = useIsDesktop();
  const hasClassSelected = Boolean(providedSubject && courseNumber && number);

  const [catalogDrawerOpen, setCatalogDrawerOpen] = useState(
    () => !isDesktop && !hasClassSelected
  );

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

  // Auto-expand drawer on mobile when no class is selected
  useEffect(() => {
    if (!isDesktop && !hasClassSelected) {
      setCatalogDrawerOpen(true);
    }
  }, [isDesktop, hasClassSelected]);

  const { data: _class } = useGetClass(
    term?.year as number,
    term?.semester as Semester,
    subject as string,
    courseNumber as string,
    number as string,
    {
      skip: !subject || !courseNumber || !number || !term,
    }
  );

  // Keep reference to last valid class to prevent blank frames during transitions
  const lastClassRef = useRef(_class);
  if (_class) {
    lastClassRef.current = _class;
  }
  const displayedClass = _class ?? lastClassRef.current;

  const handleSelect = useCallback(
    (subject: string, courseNumber: string, number: string) => {
      if (!term) return;

      setCatalogDrawerOpen(false); // Close drawer when selecting a class

      navigate({
        ...location,
        pathname: `/catalog/${term.year}/${term.semester}/${subject}/${courseNumber}/${number}`,
      });
    },
    [navigate, location, term]
  );

  if (termsLoading) {
    return <CatalogSkeleton />;
  }

  // TODO: Error state
  if (!terms || !term) {
    return <></>;
  }

  // TODO: Class error state, class loading state
  return (
    <div className={styles.root}>
      {isDesktop ? (
        // Desktop: Static panel
        <div className={styles.panel}>
          <ClassBrowser
            onSelect={handleSelect}
            semester={term.semester}
            year={term.year}
            terms={terms}
            persistent
          />
        </div>
      ) : (
        // Mobile: Drawer overlay
        <>
          <AnimatePresence>
            {catalogDrawerOpen && (
              <motion.div
                className={styles.overlay}
                onClick={() => setCatalogDrawerOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
          <motion.div
            className={styles.catalogDrawer}
            animate={{ x: catalogDrawerOpen ? 0 : "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <ClassBrowser
              onSelect={handleSelect}
              semester={term.semester}
              year={term.year}
              terms={terms}
              persistent
            />
          </motion.div>
        </>
      )}

      {!isDesktop && (
        <div
          className={styles.drawerTrigger}
          onClick={() => setCatalogDrawerOpen(true)}
        >
          {!catalogDrawerOpen && <NavArrowRight />}
        </div>
      )}

      <Flex direction="column" flexGrow="1" className={styles.view}>
        <AnimatePresence initial={false}>
          {displayedClass && (
            <motion.div
              key={`${subject}-${courseNumber}-${number}`}
              className={styles.classContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <Class class={displayedClass} />
            </motion.div>
          )}
        </AnimatePresence>
      </Flex>
    </div>
  );
}
