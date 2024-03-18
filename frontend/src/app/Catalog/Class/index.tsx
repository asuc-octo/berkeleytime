import { useMemo, useState } from "react";

import { useQuery } from "@apollo/client";
import { Bookmark, Plus, Xmark } from "iconoir-react";
import { Link, useSearchParams } from "react-router-dom";

import AverageGrade from "@/components/AverageGrade";
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
    const { unitsMin: minimum, unitsMax: maximum } =
      currentClass ?? partialClass;

    return maximum === minimum
      ? `${minimum} ${minimum === 1 ? "unit" : "units"}`
      : `${minimum} - ${maximum} units`;
  }, [currentClass, partialClass]);

  const Component = useMemo(() => views[view].Component, [view]);

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
          {/*<Button secondary>
            <ArrowSeparateVertical />
            {currentSemester} {currentYear}
            </Button>*/}
          <AverageGrade
            averageGrade={
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
            {/*currentClass?.primarySection.instructors.map((instructor) => (
              <div key={instructor.familyName} className={styles.description}>
                {instructor.givenName} {instructor.familyName}
              </div>
            ))*/}
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
      </div>
      <div className={styles.view}>
        <Component />
      </div>
    </div>
  );
}
