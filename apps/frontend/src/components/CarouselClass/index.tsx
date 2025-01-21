import { useMemo } from "react";

import { OpenInWindow } from "iconoir-react";

import AverageGrade from "@/components/AverageGrade";
import Capacity from "@/components/Capacity";
import Units from "@/components/Units";
import { useReadClass } from "@/hooks/api";
import { Semester } from "@/lib/api";

import styles from "./CarouselClass.module.scss";
import { Link } from "react-router-dom";

interface CarouselClassProps {
  year: number;
  semester: Semester;
  subject: string;
  courseNumber: string;
  number: string;
}

export default function CarouselClass({
  year,
  semester,
  subject,
  courseNumber,
  number,
}: CarouselClassProps) {
  const { data, loading } = useReadClass(
    year as number,
    semester as Semester,
    subject as string,
    courseNumber as string,
    number as string
  );

  const _class = useMemo(() => data, [data]);

  return loading || !_class ? (
    <></>
  ) : (
    <Link
      className={styles.root}
      to={`/catalog/${year}/${semester}/${subject}/${courseNumber}/${number}`}
    >
      <div className={styles.text}>
        <p className={styles.heading}>
          {_class.subject} {_class.courseNumber} #{_class.number}
        </p>
        <p className={styles.description}>
          {_class.title ?? _class.course.title}
        </p>
        <div className={styles.row}>
          <AverageGrade gradeDistribution={_class.gradeDistribution} />
          <Capacity
            enrollCount={_class.primarySection.enrollCount}
            enrollMax={_class.primarySection.enrollMax}
            waitlistCount={_class.primarySection.waitlistCount}
            waitlistMax={_class.primarySection.waitlistMax}
          />
          <Units unitsMin={_class.unitsMin} unitsMax={_class.unitsMax} />
        </div>
      </div>
      <div className={styles.column}>
        <div className={styles.icon}>
          <OpenInWindow />
        </div>
      </div>
    </Link>
  );
}
