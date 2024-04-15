import { useMemo, useState } from "react";

import { useQuery } from "@apollo/client";
import { BookmarkSolid, CalendarPlus, Heart, Xmark } from "iconoir-react";
import { Link, useSearchParams } from "react-router-dom";

import AverageGrade from "@/components/AverageGrade";
import Button from "@/components/Button";
import CCN from "@/components/CCN";
import Capacity from "@/components/Capacity";
import IconButton from "@/components/IconButton";
import MenuItem from "@/components/MenuItem";
import Units from "@/components/Units";
import {
  GET_CLASS,
  ICatalogClass,
  ICatalogCourse,
  IClass,
  Semester,
} from "@/lib/api";

import styles from "./Class.module.scss";
import Overview from "./Overview";
import Sections from "./Sections";

const views = [
  {
    text: "Overview",
    Component: Overview,
  },
  {
    text: "Sections",
    Component: Sections,
  },
  {
    text: "Grades",
    Component: () => null,
  },
  {
    text: "Enrollment",
    Component: () => null,
  },
];

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
  const [view, setView] = useState(0);

  // TODO: Query for enrollment and grades data in the background

  const { data: classData } = useQuery<{ class: IClass }>(GET_CLASS, {
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

  const currentClass = useMemo(() => classData?.class, [classData?.class]);

  const Component = useMemo(() => views[view].Component, [view]);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.group}>
          <div className={styles.row}>
            <Button secondary>
              <Heart />
              23
            </Button>
            <IconButton>
              <BookmarkSolid />
            </IconButton>
            <IconButton>
              <CalendarPlus />
            </IconButton>
          </div>
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
        <h1 className={styles.heading}>
          {currentSubject} {currentCourseNumber}
        </h1>
        <p className={styles.description}>
          {currentClass?.title ?? partialClass.title ?? currentCourse.title}
        </p>
        <div className={styles.row}>
          <AverageGrade
            gradeAverage={
              currentClass?.course?.gradeAverage ?? currentCourse.gradeAverage
            }
          />
          <Capacity
            count={currentClass?.enrollCount ?? partialClass.enrollCount}
            capacity={currentClass?.enrollMax ?? partialClass.enrollMax}
            waitlistCount={
              currentClass?.waitlistCount ?? partialClass.waitlistCount
            }
            waitlistCapacity={
              currentClass?.waitlistMax ?? partialClass.waitlistMax
            }
          />
          <Units
            unitsMax={currentClass?.unitsMax ?? partialClass.unitsMax}
            unitsMin={currentClass?.unitsMin ?? partialClass.unitsMin}
          />
          {currentClass && <CCN ccn={currentClass.primarySection.ccn} />}
        </div>
      </div>
      <div className={styles.menu}>
        {views.map(({ text }, index) => (
          <MenuItem
            key={index}
            active={index === view}
            onClick={() => setView(index)}
          >
            {text}
          </MenuItem>
        ))}
      </div>
      <div className={styles.view}>
        <Component currentClass={currentClass} />
      </div>
    </div>
  );
}
