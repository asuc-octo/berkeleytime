import { useCallback, useMemo } from "react";

import { useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";

import Boundary from "@/components/Boundary";
import LoadingIndicator from "@/components/LoadingIndicator";
import { GET_COURSES, ICatalogCourse, Semester } from "@/lib/api";

import Filters from "../../components/Filters";
import List from "../../components/List";
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

  // TODO: Fetch available years
  const currentYear = useMemo(() => (year && parseInt(year)) || 2024, [year]);

  // TODO: Fetch available semesters
  const currentSemester = useMemo(
    () =>
      semester
        ? ((semester[0].toUpperCase() +
            semester.slice(1).toLowerCase()) as Semester)
        : Semester.Spring,
    [semester]
  );

  const currentSubject = useMemo(() => subject?.toUpperCase(), [subject]);

  const { loading, error, data } = useQuery<{ catalog: ICatalogCourse[] }>(
    GET_COURSES,
    {
      variables: {
        term: {
          semester: currentSemester,
          year: currentYear,
        },
      },
    }
  );

  const courses = useMemo(() => data?.catalog ?? [], [data?.catalog]);

  const currentCourse = useMemo(
    () =>
      courses.find(
        (course) =>
          course.subject === currentSubject &&
          course.number === currentCourseNumber &&
          course.classes.some((class_) => class_.number === currentClassNumber)
      ),
    [courses, currentSubject, currentCourseNumber, currentClassNumber]
  );

  const setClass = useCallback(
    (course: ICatalogCourse, number: string) => {
      navigate(
        `/catalog/${currentYear}/${currentSemester}/${course.subject}/${course.number}/${number}`
      );
    },
    [navigate, currentYear, currentSemester]
  );

  return loading || error ? (
    <Boundary>
      <LoadingIndicator />
    </Boundary>
  ) : (
    <div className={styles.root}>
      <Filters />
      <List courses={courses} setClass={setClass} />
      {currentClassNumber &&
      currentCourseNumber &&
      currentSubject &&
      currentCourse ? (
        <Class
          currentCourse={currentCourse}
          currentSemester={currentSemester}
          currentYear={currentYear}
          currentClassNumber={currentClassNumber}
          currentCourseNumber={currentCourseNumber}
          currentSubject={currentSubject}
        />
      ) : (
        <></>
      )}
    </div>
  );
}
