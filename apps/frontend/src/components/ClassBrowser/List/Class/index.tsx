import { ComponentPropsWithRef, MouseEventHandler } from "react";

import { ArrowRight } from "iconoir-react";

import AverageGrade from "@/components/AverageGrade";
import Capacity from "@/components/Capacity";
import Units from "@/components/Units";
import { IClass } from "@/lib/api";

import styles from "./Class.module.scss";

interface Props {
  index: number;
  onClick: MouseEventHandler<HTMLDivElement>;
}

type ClassProps = Props & IClass;

export default function Class({
  course: {
    title: courseTitle,
    subject,
    number: courseNumber,
    gradeDistribution,
  },
  title,
  number,
  primarySection: { enrollment },
  unitsMax,
  unitsMin,
  decal,
  index,
  ...props
}: ClassProps & Omit<ComponentPropsWithRef<"div">, keyof ClassProps>) {
  return (
    <div className={styles.root} data-index={index} {...props}>
      <div className={styles.text}>
        <p className={styles.heading}>
          {subject} {courseNumber} #{number}
          {decal && <span className={styles.decalTag}>Decal</span>}
        </p>
        <p className={styles.description}>{title ?? courseTitle}</p>
        <div className={styles.row}>
          <AverageGrade gradeDistribution={gradeDistribution} />
          <Capacity
            enrolledCount={enrollment?.latest.enrolledCount}
            maxEnroll={enrollment?.latest.maxEnroll}
            waitlistedCount={enrollment?.latest.waitlistedCount}
            maxWaitlist={enrollment?.latest.maxWaitlist}
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
  );
}
