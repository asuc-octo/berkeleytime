import { HTMLAttributes, forwardRef, useMemo } from "react";

import {
  ArrowRight,
  ArrowSeparateVertical,
  ArrowUnionVertical,
} from "iconoir-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import AverageGrade from "@/app/Catalog/AverageGrade";
import Capacity from "@/app/Catalog/Capacity";
import { ICatalogCourse, Semester } from "@/lib/api";

import styles from "./Course.module.scss";

interface CourseProps {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  semester: Semester;
  year: number;
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
      semester,
      year,
      gradeAverage,
      expanded,
      setExpanded,
      ...props
    },
    ref
  ) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const single = useMemo(() => classes.length === 1, [classes]);

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

    const handleClick = () => {
      if (single) {
        navigate({
          pathname: `/catalog/${year}/${semester}/${subject}/${courseNumber}/${classes[0].number}`,
          search: searchParams.toString(),
        });

        return;
      }

      setExpanded(!expanded);
    };

    return (
      <div className={styles.root} ref={ref} {...props}>
        <div className={styles.course}>
          <div className={styles.class} onClick={handleClick}>
            <div className={styles.text}>
              <p className={styles.heading}>
                {subject} {courseNumber}
              </p>
              <p className={styles.description}>{courseTitle}</p>
              <div className={styles.row}>
                <AverageGrade averageGrade={gradeAverage} />
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
            <div className={styles.icon}>
              {single ? (
                <ArrowRight />
              ) : expanded ? (
                <ArrowUnionVertical />
              ) : (
                <ArrowSeparateVertical />
              )}
            </div>
          </div>
          {expanded &&
            classes.map(
              ({
                title: classTitle,
                unitsMax,
                unitsMin,
                enrollCount,
                enrollMax,
                waitlistCount,
                waitlistMax,
                number: classNumber,
              }) => (
                <Link
                  className={styles.class}
                  key={classNumber}
                  to={{
                    pathname: `/catalog/${year}/${semester}/${subject}/${courseNumber}/${classNumber}`,
                    search: searchParams.toString(),
                  }}
                >
                  <div className={styles.text}>
                    <p className={styles.title}>Lecture</p>
                    <p className={styles.description}>
                      {classTitle ?? courseTitle}
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
                  <div className={styles.icon}>
                    <ArrowRight />
                  </div>
                </Link>
              )
            )}
        </div>
      </div>
    );
  }
);

export default Course;
