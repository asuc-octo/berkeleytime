import { forwardRef, useMemo } from "react";

import {
  ArrowRight,
  ArrowSeparateVertical,
  ArrowUnionVertical,
} from "iconoir-react";

import AverageGrade from "@/components/AverageGrade";
import Capacity from "@/components/Capacity";
import Units from "@/components/Units";
import { ICourse } from "@/lib/api";

import styles from "./Course.module.scss";

interface CourseProps {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  onClassSelect: (number: string) => void;
  index: number;
}

const Course = forwardRef<HTMLDivElement, CourseProps & ICourse>(
  (
    {
      title: courseTitle,
      subject,
      classes,
      number: courseNumber,
      gradeAverage,
      expanded,
      setExpanded,
      onClassSelect,
      index,
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
              primarySection: {
                waitlistCount,
                waitlistMax,
                enrollCount,
                enrollMax,
              },
              unitsMax,
              unitsMin,
            }
          ) => ({
            courseWaitlistCount: courseWaitlistCount + waitlistCount,
            courseWaitlistCapacity: courseWaitlistCapacity + waitlistMax,
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
            courseMinimum: Infinity,
            courseMaximum: 0,
          }
        ),
      [classes]
    );

    const handleClick = (number?: string) => {
      if (number) onClassSelect(number);
      else if (isolated) onClassSelect(classes[0].number);
      else setExpanded(!expanded);
    };

    return (
      <div className={styles.root} ref={ref} data-index={index}>
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
                enrollCount={courseCount}
                enrollMax={courseCapacity}
                waitlistCount={courseWaitlistCount}
                waitlistMax={courseWaitlistCapacity}
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
              title: classTitle,
              number: classNumber,
              primarySection: {
                enrollCount,
                enrollMax,
                waitlistCount,
                waitlistMax,
                component,
              },
            }) => (
              <div
                className={styles.class}
                key={classNumber}
                onClick={() => handleClick(classNumber)}
              >
                <div className={styles.text}>
                  <p className={styles.title}>
                    {component} {classNumber}
                  </p>
                  <p className={styles.description}>
                    {classTitle || courseTitle}
                  </p>
                  <div className={styles.row}>
                    <Capacity
                      enrollCount={enrollCount}
                      enrollMax={enrollMax}
                      waitlistCount={waitlistCount}
                      waitlistMax={waitlistMax}
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
    );
  }
);

export default Course;
