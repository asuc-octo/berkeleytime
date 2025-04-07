import { ComponentPropsWithRef, MouseEventHandler } from "react";

import { ArrowRight } from "iconoir-react";

import { AverageGrade } from "@/components/AverageGrade";
import { ICourse } from "@/lib/api";

import styles from "./Course.module.scss";

interface Props {
  index: number;
  onClick: MouseEventHandler<HTMLDivElement>;
}

type CourseProps = Props & ICourse;

export default function Course({
  title,
  subject,
  number,
  gradeDistribution,
  index,
  ...props
}: CourseProps & Omit<ComponentPropsWithRef<"div">, keyof CourseProps>) {
  return (
    <div className={styles.root} data-index={index} {...props}>
      <div className={styles.text}>
        <p className={styles.heading}>
          {subject} {number}
        </p>
        <p className={styles.description}>{title}</p>
        <div className={styles.row}>
          <AverageGrade gradeDistribution={gradeDistribution} />
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
