import { HTMLAttributes, forwardRef, useMemo } from "react";

import {
  ArrowRight,
  ArrowSeparateVertical,
  ArrowUnionVertical,
} from "iconoir-react";

import AverageGrade from "@/components/AverageGrade";
import Capacity from "@/components/Capacity";
import Units from "@/components/Units";
import { ICatalogCourse } from "@/lib/api";

import styles from "./Course.module.scss";

interface CourseProps {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  onCourseSelect: (number: string) => void;
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
      onCourseSelect,
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
      if (number) onCourseSelect(number);
      else if (isolated) onCourseSelect(classes[0].number);
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
                <Units unitsMin={courseMinimum} unitsMax={courseMaximum} />
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
                      <Units unitsMin={unitsMin} unitsMax={unitsMax} />
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
