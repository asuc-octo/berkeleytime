import { useMemo, useState } from "react";

import {
  ArrowRight,
  ArrowSeparateVertical,
  ArrowUnionVertical,
} from "iconoir-react";
import { Link } from "react-router-dom";

import AverageGrade from "@/components/AverageGrade";
import Capacity from "@/components/Capacity";

import styles from "./Course.module.scss";

interface IClass {
  title: string;
  unitsMax: number;
  unitsMin: number;
  enrollCount: number;
  enrollMax: number;
  waitlistCount: number;
}

interface ICourse {
  title: string;
  subject: string;
  number: string;
  gradeAverage: number;
  classes: IClass[];
}

interface CourseProps {
  course: ICourse;
}

export default function Course({
  course: { title, subject, classes, number, gradeAverage },
}: CourseProps) {
  const [expanded, setExpanded] = useState(false);

  const single = useMemo(() => classes.length === 1, [classes]);

  const { waitlisted, enrolled, capacity, minimum, maximum } = useMemo(
    () =>
      classes.reduce(
        (
          { waitlisted, enrolled, capacity, minimum, maximum },
          { waitlistCount, enrollCount, enrollMax, unitsMax, unitsMin }
        ) => ({
          waitlisted: waitlisted + waitlistCount,
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
      // TODO: Navigate

      return;
    }

    setExpanded(!expanded);
  };

  return (
    <div className={styles.root}>
      <div className={styles.class} onClick={handleClick}>
        <div className={styles.text}>
          <p className={styles.heading}>
            {subject} {number}
          </p>
          <p className={styles.description}>{title}</p>
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
            title,
            unitsMax,
            unitsMin,
            enrollCount: enrolled,
            enrollMax: capacity,
            waitlistCount: waitlisted,
          }) => (
            <Link className={styles.class} to="">
              <div className={styles.text}>
                <p className={styles.title}>Lecture</p>
                <p className={styles.description}>{title}</p>
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
  );
}
