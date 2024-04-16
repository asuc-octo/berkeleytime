import { useCallback, useMemo } from "react";

import { useQuery } from "@apollo/client";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import Boundary from "@/components/Boundary";
import Browser from "@/components/Browser";
import LoadingIndicator from "@/components/LoadingIndicator";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { GET_COURSES, ICatalogCourse, Semester } from "@/lib/api";

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
  const { width } = useWindowDimensions();

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

  // TODO: Error state, loading state
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
      navigate({
        pathname: `/catalog/${currentYear}/${currentSemester}/${course.subject}/${course.number}/${number}`,
        search: searchParams.toString(),
      });
    },
    [navigate, currentYear, currentSemester, searchParams]
  );

  const currentClass = useMemo(
    () =>
      currentClassNumber &&
      currentCourseNumber &&
      currentSubject &&
      currentCourse,
    [currentClassNumber, currentCourseNumber, currentSubject, currentCourse]
  );

  // The browser will be responsive at 1400px
  const responsive = useMemo(() => width <= 1400, [width]);

  // The screen will be separated into views at 992px
  const block = useMemo(() => width <= 992, [width]);

  return loading || error ? (
    <Boundary>
      <LoadingIndicator />
    </Boundary>
  ) : (
    <div className={styles.root}>
      <Browser
        courses={courses}
        setClass={setClass}
        responsive={responsive}
        semester={currentSemester}
        year={currentYear}
        block={block}
      />
      {currentClass ? (
        <Class
          currentCourse={currentCourse!}
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
