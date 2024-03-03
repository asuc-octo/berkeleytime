import { HTMLAttributes, forwardRef, useMemo } from "react";

import {
  ArrowRight,
  ArrowSeparateVertical,
  ArrowUnionVertical,
} from "iconoir-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import AverageGrade from "@/components/AverageGrade";
import Capacity from "@/components/Capacity";
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

    const { waitlisted, enrolled, capacity, minimum, maximum } = useMemo(
      () =>
        classes.reduce(
          (
            { waitlisted, enrolled, capacity, minimum, maximum },
            { enrollCount, enrollMax, unitsMax, unitsMin }
          ) => ({
            // waitlisted: waitlisted + waitlistCount,
            waitlisted,
            enrolled: enrolled + enrollCount,
            capacity: capacity + enrollMax,
            minimum: Math.min(minimum, unitsMin),
            maximum: Math.max(maximum, unitsMax),
          }),
          { waitlisted: 0, enrolled: 0, capacity: 0, minimum: 10, maximum: 0 }
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
                  waitlisted={waitlisted}
                  enrolled={enrolled}
                  capacity={capacity}
                />
                <div className={styles.units}>
                  {maximum === minimum
                    ? `${minimum} ${minimum === 1 ? "unit" : "units"}`
                    : `${minimum} - ${maximum} units`}
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
                enrollCount: enrolled,
                enrollMax: capacity,
                waitlistCount: waitlisted,
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
                        waitlisted={waitlisted}
                        enrolled={enrolled}
                        capacity={capacity}
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
