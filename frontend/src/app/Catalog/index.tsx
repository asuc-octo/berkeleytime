import { useCallback, useMemo, useState } from "react";

import { useQuery } from "@apollo/client";
import classNames from "classnames";
import { Xmark } from "iconoir-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import Class from "@/components/Class";
import ClassBrowser from "@/components/ClassBrowser";
import IconButton from "@/components/IconButton";
import {
  GET_CLASS,
  GET_COURSE,
  GetClassResponse,
  GetCourseResponse,
  IClass,
  Semester,
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

  // TODO: Select year
  const year = useMemo(
    () => (currentYear && parseInt(currentYear)) || 2024,
    [currentYear]
  );

  // TODO: Select semester
  const semester = useMemo(
    () =>
      currentSemester
        ? ((currentSemester[0].toUpperCase() +
            currentSemester.slice(1).toLowerCase()) as Semester)
        : Semester.Spring,
    [currentSemester]
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
        semester,
        year,
      },
      subject,
      courseNumber,
      classNumber,
    },
    skip: !subject || !courseNumber || !classNumber,
  });

  // Fetch the course to for directing to the correct term
  const { loading: courseLoading, error: courseError } =
    useQuery<GetCourseResponse>(GET_COURSE, {
      variables: {
        subject,
        courseNumber,
      },
      skip: !subject || !courseNumber || !classNumber,
    });

  const _class = useMemo(() => classData?.class, [classData]);

  const handleClassSelect = useCallback(
    (selectedClass: IClass) => {
      setPartialClass(selectedClass);
      setOpen(true);

      navigate({
        pathname: `/catalog/${year}/${semester}/${selectedClass.course.subject}/${selectedClass.course.number}/${selectedClass.number}`,
        search: searchParams.toString(),
      });
    },
    [navigate, currentYear, currentSemester, searchParams]
  );

  return (
    <div
      className={classNames(styles.root, {
        [styles.expanded]: expanded,
        [styles.open]: open,
      })}
    >
      <div className={styles.panel}>
        <div className={styles.header}>
          <p className={styles.title}>
            {semester} {year}
          </p>
          <IconButton onClick={() => setOpen(true)}>
            <Xmark />
          </IconButton>
        </div>
        <div className={styles.body}>
          <ClassBrowser
            onClassSelect={handleClassSelect}
            semester={semester}
            year={year}
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
            year={year}
            semester={semester}
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
  );
}
