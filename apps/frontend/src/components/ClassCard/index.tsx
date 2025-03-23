import { ComponentPropsWithRef } from "react";

import { ArrowRight } from "iconoir-react";

import AverageGrade from "@/components/AverageGrade";
import Capacity from "@/components/Capacity";
import Units from "@/components/Units";
import { IClass } from "@/lib/api";

import styles from "./ClassCard.module.scss";

interface ClassProps {
  class: IClass;
}

export default function ClassCard({
  class: data,
  ...props
}: ClassProps & Omit<ComponentPropsWithRef<"div">, keyof ClassProps>) {
  return (
    <div className={styles.root} {...props}>
      <div className={styles.body}>
        <p className={styles.heading}>
          {data.subject} {data.courseNumber} #{data.number}
        </p>
        <p className={styles.description}>{data.title ?? data.course.title}</p>
        <div className={styles.footer}>
          <AverageGrade gradeDistribution={data.gradeDistribution} />
          <Capacity
            enrolledCount={data.primarySection.enrollment?.latest.enrolledCount}
            maxEnroll={data.primarySection.enrollment?.latest.maxEnroll}
            waitlistedCount={
              data.primarySection.enrollment?.latest.waitlistedCount
            }
            maxWaitlist={data.primarySection.enrollment?.latest.maxWaitlist}
          />
          <Units unitsMin={data.unitsMin} unitsMax={data.unitsMax} />
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
