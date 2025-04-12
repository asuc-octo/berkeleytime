import { ComponentPropsWithRef } from "react";

import { Plus } from "iconoir-react";

import { IconButton } from "@repo/theme";

import Units from "@/components/Units";
import { ICourse, Semester } from "@/lib/api";

import Catalog from "./Catalog";
import Course from "./Course";
import styles from "./Term.module.scss";

interface TermProps {
  semester: Semester;
  year: number;
  courses: ICourse[];
  onClick: (course: ICourse) => void;
}

export default function Term({
  semester,
  year,
  courses,
  onClick,
  ref,
}: Omit<ComponentPropsWithRef<"div">, keyof TermProps> & TermProps) {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <p className={styles.term}>
          {semester} {year}
        </p>
        <Units unitsMin={12} unitsMax={20}>
          {(units) => <p className={styles.units}>{units}</p>}
        </Units>
        <Catalog onClick={onClick} semester={semester} year={year}>
          <IconButton>
            <Plus />
          </IconButton>
        </Catalog>
      </div>
      <div className={styles.body} ref={ref}>
        {courses.map((course) => (
          <Course key={`${course.subject} ${course.number}`} {...course} />
        ))}
      </div>
    </div>
  );
}
