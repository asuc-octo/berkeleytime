import { forwardRef } from "react";

import { Plus } from "iconoir-react";

import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import Units from "@/components/Units";
import { ICourse, Semester } from "@/lib/api";

import Catalog from "./Catalog";
import Course from "./Course";
import styles from "./Semester.module.scss";

interface TermProps {
  semester: Semester;
  year: number;
  courses: ICourse[];
  onClick: (course: ICourse) => void;
}

const Term = forwardRef<HTMLDivElement, TermProps>(
  ({ semester, year, courses, onClick }, ref) => {
    return (
      <div className={styles.root}>
        <div className={styles.header}>
          <p className={styles.title}>
            {semester} {year}
          </p>
          <Units unitsMin={12} unitsMax={20} />
          <IconButton>
            <Plus />
          </IconButton>
        </div>
        <div className={styles.body} ref={ref}>
          {courses.map((course) => (
            <Course key={`${course.subject} ${course.number}`} {...course} />
          ))}
        </div>
        <div className={styles.footer}>
          <Catalog semester={Semester.Spring} year={2024} onClick={onClick}>
            <Button secondary>
              <Plus />
              Add class
            </Button>
          </Catalog>
        </div>
      </div>
    );
  }
);

Term.displayName = "Semester";

export default Term;
