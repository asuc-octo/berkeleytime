import { useCallback, useMemo, useState } from "react";

import { useQuery } from "@apollo/client";
import classNames from "classnames";
import { Xmark } from "iconoir-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { Boundary, IconButton, LoadingIndicator } from "@repo/theme";

import Class from "@/components/Class";
import ClassBrowser from "@/components/ClassBrowser";
import {
  GET_CLASS,
  GET_COURSE,
  GET_TERMS,
  GetClassResponse,
  GetCourseResponse,
  GetTermsResponse,
  IClass,
  TemporalPosition,
} from "@/lib/api";

import styles from "./Catalog.module.scss";
import Dashboard from "./Dashboard";

export default function Catalog() {
  const {
    year: currentYear,
    semester: currentSemester,
    subject: currentSubject,
    courseNumber,
    classNumber,
  } = useParams();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [expanded, setExpanded] = useState(true);
  const [open, setOpen] = useState(false);
  const [partialClass, setPartialClass] = useState<IClass | null>(null);

  const { data, loading } = useQuery<GetTermsResponse>(GET_TERMS);

  const terms = useMemo(() => data?.terms, [data]);

  const selectedTerm = useMemo(() => {
    if (!currentYear || !currentSemester) return;

    const semester =
      currentSemester[0].toUpperCase() + currentSemester.slice(1);

    return terms?.find(
      (term) =>
        term.year === parseInt(currentYear) && term.semester === semester
    );
  }, [terms, currentYear, currentSemester]);

  const currentTerm = useMemo(
    () =>
      selectedTerm ??
      terms?.find((term) => term.temporalPosition === TemporalPosition.Current),
    [terms]
  );

  const subject = useMemo(
    () => currentSubject?.toUpperCase(),
    [currentSubject]
  );

  const {
    data: classData,
    loading: classLoading,
    error: classError,
  } = useQuery<GetClassResponse>(GET_CLASS, {
    variables: {
      term: {
        semester: currentTerm?.semester,
        year: currentTerm?.year,
      },
      subject,
      courseNumber,
      classNumber,
    },
    skip: !subject || !courseNumber || !classNumber || !currentTerm,
  });

  // Fetch the course to for directing to the correct term
  const { loading: courseLoading, error: courseError } =
    useQuery<GetCourseResponse>(GET_COURSE, {
      variables: {
        subject,
        courseNumber,
      },
      skip: !subject || !courseNumber,
    });

  const _class = useMemo(() => classData?.class, [classData]);

  const handleClassSelect = useCallback(
    (selectedClass: IClass) => {
      if (!currentTerm) return;

      setPartialClass(selectedClass);
      setOpen(true);

      navigate({
        pathname: `/catalog/${currentTerm.year}/${currentTerm.semester}/${selectedClass.course.subject}/${selectedClass.course.number}/${selectedClass.number}`,
        search: searchParams.toString(),
      });
    },
    [navigate, currentYear, currentSemester, searchParams, currentTerm]
  );

  return loading ? (
    <Boundary>
      <LoadingIndicator size="lg" />
    </Boundary>
  ) : currentTerm ? (
    <div
      className={classNames(styles.root, {
        [styles.expanded]: expanded,
        [styles.open]: open,
      })}
    >
      <div className={styles.panel}>
        <div className={styles.header}>
          <p className={styles.title}>
            {currentTerm.semester} {currentTerm.year}
          </p>
          <IconButton onClick={() => setOpen(true)}>
            <Xmark />
          </IconButton>
        </div>
        <div className={styles.body}>
          <ClassBrowser
            onClassSelect={handleClassSelect}
            semester={currentTerm.semester}
            year={currentTerm.year}
            persistent
          />
        </div>
      </div>
      <div className={styles.view}>
        {courseNumber && classNumber && subject && (_class || partialClass) ? (
          <Class
            subject={subject}
            courseNumber={courseNumber}
            classNumber={classNumber}
            partialClass={partialClass}
            year={currentTerm.year}
            semester={currentTerm.semester}
            expanded={expanded}
            onExpandedChange={setExpanded}
            onClose={() => setOpen(false)}
          />
        ) : classLoading || courseLoading ? (
          <>{/* Loading */}</>
        ) : classError || courseError ? (
          <>{/* Error */}</>
        ) : (
          <Dashboard
            expanded={expanded}
            setExpanded={setExpanded}
            setOpen={setOpen}
          />
        )}
      </div>
    </div>
  ) : (
    <>{/* Error */}</>
  );
}
