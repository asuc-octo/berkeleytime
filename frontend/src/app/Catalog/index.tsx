import { useCallback, useMemo, useState } from "react";

import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import Browser from "@/components/Browser";
import { IClass, Semester } from "@/lib/api";

import styles from "./Catalog.module.scss";
import Class from "./Class";

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

  const [partialCurrentClass, setPartialCurrentClass] = useState<IClass | null>(
    null
  );

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
    (_class: IClass) => {
      setPartialCurrentClass(_class);

      navigate({
        pathname: `/catalog/${currentYear}/${currentSemester}/${_class.course.subject}/${_class.course.number}/${_class.number}`,
        search: searchParams.toString(),
      });
    },
    [navigate, currentYear, currentSemester, searchParams]
  );

  return (
    <div className={styles.root}>
      <Browser
        onSelect={handleClick}
        semester={currentSemester}
        year={currentYear}
        persistent
      />
      {currentClassNumber && currentCourseNumber && currentSubject ? (
        <Class
          partialCurrentClass={partialCurrentClass}
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
