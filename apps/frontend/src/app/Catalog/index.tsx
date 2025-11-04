import { useCallback, useMemo, useState } from "react";

import classNames from "classnames";
import { Xmark } from "iconoir-react";
import moment from "moment";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Flex, IconButton } from "@repo/theme";

import Class from "@/components/Class";
import ClassBrowser from "@/components/ClassBrowser";
import { useReadTerms } from "@/hooks/api";
import { useReadClass } from "@/hooks/api/classes/useReadClass";
import { Semester, TemporalPosition } from "@/lib/api";
import { RecentType, addRecent, getRecents } from "@/lib/recent";

import styles from "./Catalog.module.scss";

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

    const ugrdTerms = terms.filter(
      (term) => term.academicCareerCode === "UGRD"
    );

    const recentTerm = getRecents(RecentType.CatalogTerm)[0];

    // Check if recent term is still valid (within 7 days TTL)
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const isRecentTermValid =
      recentTerm?.timestamp &&
      Date.now() - recentTerm.timestamp < SEVEN_DAYS_MS;

    const currentTerm = ugrdTerms.find(
      (term) => term.temporalPosition === TemporalPosition.Current
    );

    // Show semester when enrollment opens (We assume that selfServiceEnrollBeginDate refers to the official date on which the school publishes the semester catalog!)
    const now = moment();

    const nextTerm = ugrdTerms
      .filter((term) => term.selfServiceEnrollBeginDate && term.startDate)
      .toSorted((a, b) => {
        return moment(a.selfServiceEnrollBeginDate).diff(
          moment(b.selfServiceEnrollBeginDate)
        );
      })
      .find((term) => {
        const enrollmentHasStarted = now.isAfter(
          moment(term.selfServiceEnrollBeginDate)
        );
        const semesterHasntStarted = moment(term.startDate).isAfter(now);

        return (
          term.temporalPosition === TemporalPosition.Future &&
          enrollmentHasStarted &&
          semesterHasntStarted
        );
      });

    // Selection priority:
    // 1. URL parameter (explicit user choice)
    // 2. Recent term (localStorage, within 7 day TTL)
    // 3. Smart selection: if enrollment is starting soon, show that term
    // 4. Current term
    const selectedTerm =
      ugrdTerms?.find(
        (term) => term.year === year && term.semester === semester
      ) ??
      (isRecentTermValid
        ? ugrdTerms.find(
            (term) =>
              term.year === recentTerm?.year &&
              term.semester === recentTerm?.semester
          )
        : null) ??
      nextTerm ??
      currentTerm;

    if (selectedTerm) {
      addRecent(RecentType.CatalogTerm, {
        year: selectedTerm.year,
        semester: selectedTerm.semester,
        timestamp: Date.now(),
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
    term?.semester as Semester,
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

      navigate({
        ...location,
        pathname: `/catalog/${term.year}/${term.semester}/${subject}/${courseNumber}/${number}`,
      });
    },
    [navigate, location, term]
  );

  // TODO: Loading state
  if (termsLoading) {
    return <></>;
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
      <Flex direction="column" flexGrow="1" className={styles.view}>
        {classLoading ? (
          <></>
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
