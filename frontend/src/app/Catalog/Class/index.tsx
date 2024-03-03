import { useMemo } from "react";

import { useQuery } from "@apollo/client";
import { ArrowSeparateVertical, Bookmark, Plus, Xmark } from "iconoir-react";
import { Link, useSearchParams } from "react-router-dom";

import AverageGrade from "@/components/AverageGrade";
import Button from "@/components/Button";
import Capacity from "@/components/Capacity";
import IconButton from "@/components/IconButton";
import MenuItem from "@/components/MenuItem";
import {
  GET_CLASS,
  ICatalogClass,
  ICatalogCourse,
  IClass,
  Semester,
} from "@/lib/api";

import styles from "./Class.module.scss";

interface ClassProps {
  currentCourse: ICatalogCourse;
  currentSemester: Semester;
  currentYear: number;
  currentClassNumber: string;
  currentCourseNumber: string;
  currentSubject: string;
}

export default function Class({
  currentCourse,
  currentSemester,
  currentYear,
  currentClassNumber,
  currentCourseNumber,
  currentSubject,
}: ClassProps) {
  const [searchParams] = useSearchParams();

  const { data } = useQuery<{ class: IClass }>(GET_CLASS, {
    variables: {
      term: {
        semester: currentSemester,
        year: currentYear,
      },
      subject: currentSubject,
      courseNumber: currentCourseNumber,
      classNumber: currentClassNumber,
    },
  });

  const partialClass = useMemo(
    () =>
      currentCourse.classes.find(
        (class_) => class_.number === currentClassNumber
      ) as ICatalogClass,
    [currentCourse, currentClassNumber]
  );

  const currentClass = useMemo(() => data?.class, [data?.class]);

  const units = useMemo(() => {
    const { unitsMin, unitsMax } = currentClass ?? partialClass;

    return unitsMin === unitsMax ? unitsMin : `${unitsMin} - ${unitsMax}`;
  }, [currentClass, partialClass]);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.details}>
          <div className={styles.text}>
            <h1 className={styles.heading}>
              {currentSubject} {currentCourseNumber}
            </h1>
            <p className={styles.description}>
              {currentClass?.title ?? currentCourse.title}
            </p>
          </div>
          <div className={styles.group}>
            <IconButton>
              <Plus />
            </IconButton>
            <IconButton>
              <Bookmark />
            </IconButton>
            <Link
              to={{
                pathname: `/catalog/${currentYear}/${currentSemester}`,
                search: searchParams.toString(),
              }}
            >
              <IconButton>
                <Xmark />
              </IconButton>
            </Link>
          </div>
        </div>
        <div className={styles.information}>
          <Button secondary>
            <ArrowSeparateVertical />
            {currentSemester} {currentYear}
          </Button>
          <AverageGrade
            averageGrade={
              currentClass?.course?.gradeAverage ?? currentCourse.gradeAverage
            }
          />
          <Capacity
            enrolled={currentClass?.enrollCount ?? partialClass.enrollCount}
            capacity={currentClass?.enrollMax ?? partialClass.enrollMax}
            waitlisted={
              currentClass?.waitlistCount ?? partialClass.waitlistCount
            }
          />
          <div className={styles.units}>{units}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.detail}>
            <div className={styles.title}>Time</div>
            <div className={styles.description}>TuTh 6:30 PM - 7:59 PM</div>
          </div>
          <div className={styles.detail}>
            <div className={styles.title}>Location</div>
            <div className={styles.description}>
              Anthro/Art Practice Bldg 160
            </div>
          </div>
          <div className={styles.detail}>
            <div className={styles.title}>Instructor</div>
            <div className={styles.description}>CISSE A</div>
          </div>
        </div>
        <div className={styles.menu}>
          <MenuItem active>Overview</MenuItem>
          <MenuItem>Sections</MenuItem>
          <MenuItem>Grades</MenuItem>
          <MenuItem>Enrollment</MenuItem>
        </div>
      </div>
      <div className={styles.placeholder} />
    </div>
  );
}
