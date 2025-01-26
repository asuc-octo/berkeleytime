import { useCallback, useMemo, useState } from "react";

import classNames from "classnames";
import { Xmark } from "iconoir-react";
import moment from "moment";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { IconButton } from "@repo/theme";

import Class from "@/components/Class";
import ClassBrowser from "@/components/ClassBrowser";
import { useReadTerms } from "@/hooks/api";
import { useReadClass } from "@/hooks/api/classes/useReadClass";
import { Semester, TemporalPosition } from "@/lib/api";

import styles from "./Catalog.module.scss";
import Dashboard from "./Dashboard";

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

  const [expanded, setExpanded] = useState(true);
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

    // Default to the current term
    const currentTerm = terms.find(
      (term) => term.temporalPosition === TemporalPosition.Current
    );

    // Fall back to the next term when the current term has ended
    const nextTerm = terms
      .filter((term) => term.startDate)
      .toSorted((a, b) => moment(a.startDate).diff(moment(b.startDate)))
      .find((term) => term.temporalPosition === TemporalPosition.Future);

    return (
      terms?.find((term) => term.year === year && term.semester === semester) ??
      currentTerm ??
      nextTerm
    );
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
        [styles.collapsed]: !expanded,
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
            persistent
          />
        </div>
      </div>
      <div className={styles.view}>
        {classLoading ? (
          <></>
        ) : _class ? (
          <Class
            class={_class}
            expanded={expanded}
            onExpandedChange={setExpanded}
            onClose={() => setOpen(false)}
          />
        ) : (
          <Dashboard
            term={term}
            terms={terms}
            expanded={expanded}
            setExpanded={setExpanded}
            setOpen={setOpen}
          />
        )}
      </div>
    </div>
  );
}
