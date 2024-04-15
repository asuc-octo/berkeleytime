import { HTMLAttributes, forwardRef, useMemo } from "react";

import {
  ArrowRight,
  ArrowSeparateVertical,
  ArrowUnionVertical,
} from "iconoir-react";

import AverageGrade from "@/components/AverageGrade";
import Capacity from "@/components/Capacity";
import { ICatalogCourse } from "@/lib/api";

import styles from "./Course.module.scss";

interface CourseProps {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  setClass: (number: string) => void;
}

const Course = forwardRef<
  HTMLDivElement,
  CourseProps & ICatalogCourse & HTMLAttributes<HTMLDivElement>
>(
  (
    {
      title: courseTitle,
      subject,
      classes,
      number: courseNumber,
      gradeAverage,
      expanded,
      setExpanded,
      setClass,
      ...props
    },
    ref
  ) => {
    const isolated = useMemo(() => classes.length === 1, [classes]);

    const {
      courseCount,
      courseCapacity,
      courseWaitlistCount,
      courseWaitlistCapacity,
      courseMinimum,
      courseMaximum,
    } = useMemo(
      () =>
        classes.reduce(
          (
            {
              courseCount,
              courseCapacity,
              courseWaitlistCount,
              courseWaitlistCapacity,
              courseMinimum,
              courseMaximum,
            },
            {
              // waitlistCount,
              // waitlistMax,
              enrollCount,
              enrollMax,
              unitsMax,
              unitsMin,
            }
          ) => ({
            // courseWaitlistCount: courseWaitlistCount + waitlistCount,
            // courseWaitlistCapacity: courseWaitlistCapacity + waitlistMax,
            courseWaitlistCount,
            courseWaitlistCapacity,
            courseCount: courseCount + enrollCount,
            courseCapacity: courseCapacity + enrollMax,
            courseMinimum: Math.min(courseMinimum, unitsMin),
            courseMaximum: Math.max(courseMaximum, unitsMax),
          }),
          {
            courseCount: 0,
            courseCapacity: 0,
            courseWaitlistCount: 0,
            courseWaitlistCapacity: 0,
            courseMinimum: 10,
            courseMaximum: 0,
          }
        ),
      [classes]
    );

    const handleClick = (number?: string) => {
      if (number) setClass(number);
      else if (isolated) setClass("001");
      else setExpanded(!expanded);
    };

    return (
      <div className={styles.root} ref={ref} {...props}>
        <div className={styles.course}>
          <div className={styles.class} onClick={() => handleClick()}>
            <div className={styles.text}>
              <p className={styles.heading}>
                {subject} {courseNumber}
              </p>
              <p className={styles.description}>
                {isolated && classes[0].title ? classes[0].title : courseTitle}
              </p>
              <div className={styles.row}>
                <AverageGrade gradeAverage={gradeAverage} />
                <Capacity
                  count={courseCount}
                  capacity={courseCapacity}
                  waitlistCount={courseWaitlistCount}
                  waitlistCapacity={courseWaitlistCapacity}
                />
                <div className={styles.units}>
                  {courseMinimum === courseMaximum
                    ? `${courseMinimum} ${
                        courseMinimum === 1 ? "unit" : "units"
                      }`
                    : `${courseMinimum} - ${courseMaximum} units`}
                </div>
              </div>
            </div>
            <div className={styles.column}>
              <div className={styles.icon}>
                {isolated ? (
                  <ArrowRight />
                ) : expanded ? (
                  <ArrowUnionVertical />
                ) : (
                  <ArrowSeparateVertical />
                )}
              </div>
            </div>
          </div>
          {expanded &&
            classes.map(
              ({
                unitsMax,
                unitsMin,
                enrollCount,
                enrollMax,
                waitlistCount,
                waitlistMax,
                title: classTitle,
                number: classNumber,
              }) => (
                <div
                  className={styles.class}
                  key={classNumber}
                  onClick={() => handleClick(classNumber)}
                >
                  <div className={styles.text}>
                    <p className={styles.title}>Class {classNumber}</p>
                    <p className={styles.description}>
                      {classTitle || courseTitle}
                    </p>
                    <div className={styles.row}>
                      <Capacity
                        count={enrollCount}
                        capacity={enrollMax}
                        waitlistCount={waitlistCount}
                        waitlistCapacity={waitlistMax}
                      />
                      <div className={styles.units}>
                        {unitsMax === unitsMin
                          ? `${unitsMin} ${unitsMin === 1 ? "unit" : "units"}`
                          : `${unitsMin} - ${unitsMax} units`}
                      </div>
                    </div>
                  </div>
                  <div className={styles.column}>
                    <div className={styles.icon}>
                      <ArrowRight />
                    </div>
                  </div>
                </div>
              )
            )}
        </div>
      </div>
    );
  }
);

export default Course;
