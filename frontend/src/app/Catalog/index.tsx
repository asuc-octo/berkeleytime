import { useCallback, useMemo, useState } from "react";

import { useQuery } from "@apollo/client";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import Boundary from "@/components/Boundary";
import ClassBrowser from "@/components/ClassBrowser";
import LoadingIndicator from "@/components/LoadingIndicator";
import { GET_CLASS, IClass, Semester } from "@/lib/api";

import CatalogContext from "../../contexts/CatalogContext";
import styles from "./Catalog.module.scss";
import Class from "./Class";

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

  const { data, loading, error } = useQuery<{ class: IClass }>(GET_CLASS, {
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

  const _class = useMemo(() => data?.class, [data]);

  const handleClassSelect = useCallback(
    (selectedClass: IClass) => {
      setPartialClass(selectedClass);

      navigate({
        pathname: `/catalog/${year}/${semester}/${selectedClass.course.subject}/${selectedClass.course.number}/${selectedClass.number}`,
        search: searchParams.toString(),
      });
    },
    [navigate, currentYear, currentSemester, searchParams]
  );

  return (
    <div className={styles.root}>
      <ClassBrowser
        onClassSelect={handleClassSelect}
        semester={semester}
        year={year}
        persistent
      />
      {courseNumber && classNumber && subject && (_class || partialClass) ? (
        <CatalogContext.Provider
          value={{
            year,
            semester,
            subject,
            courseNumber,
            classNumber,
            partialClass,
          }}
        >
          <Class />
        </CatalogContext.Provider>
      ) : loading ? (
        <Boundary>
          <LoadingIndicator />
        </Boundary>
      ) : error ? (
        <></>
      ) : (
        <></>
      )}
    </div>
  );
}
