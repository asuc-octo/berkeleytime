import { useCallback, useMemo, useState } from "react";

import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import Browser from "@/components/Browser";
import { ICourse, Semester } from "@/lib/api";

import styles from "./Catalog.module.scss";
import Class from "./Class";

// TODO: Search by CCN and instructor

export default function Catalog() {
  const {
    year,
    semester,
    subject,
    courseNumber: currentCourseNumber,
    classNumber: currentClassNumber,
  } = useParams();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [partialCurrentCourse, setPartialCurrentCourse] =
    useState<ICourse | null>(null);

  // TODO: Select year
  const currentYear = useMemo(() => (year && parseInt(year)) || 2024, [year]);

  // TODO: Select semester
  const currentSemester = useMemo(
    () =>
      semester
        ? ((semester[0].toUpperCase() +
            semester.slice(1).toLowerCase()) as Semester)
        : Semester.Spring,
    [semester]
  );

  const currentSubject = useMemo(() => subject?.toUpperCase(), [subject]);

  const handleClick = useCallback(
    (course: ICourse, number: string) => {
      setPartialCurrentCourse(course);

      navigate({
        pathname: `/catalog/${currentYear}/${currentSemester}/${course.subject}/${course.number}/${number}`,
        search: searchParams.toString(),
      });
    },
    [navigate, currentYear, currentSemester, searchParams]
  );

  return (
    <div className={styles.root}>
      <Browser
        onClassSelect={handleClick}
        semester={currentSemester}
        year={currentYear}
      />
      {currentClassNumber && currentCourseNumber && currentSubject ? (
        <Class
          partialCurrentCourse={partialCurrentCourse}
          currentSemester={currentSemester}
          currentYear={currentYear}
          currentClassNumber={currentClassNumber!}
          currentCourseNumber={currentCourseNumber!}
          currentSubject={currentSubject!}
        />
      ) : (
        <></>
      )}
    </div>
  );
}
