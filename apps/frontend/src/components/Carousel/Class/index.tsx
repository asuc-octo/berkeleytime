import { Semester } from "@/lib/api";

import styles from "./Class.module.scss";
import ClassCard from "@/components/ClassCard";

interface ClassProps {
  year: number;
  semester: Semester;
  subject: string;
  courseNumber: string;
  number: string;
}

export default function Class({
  year,
  semester,
  subject,
  courseNumber,
  number,
}: ClassProps) {
  return <div className={styles.cont}>
    <ClassCard
      year={year}
      semester={semester}
      subject={subject}
      courseNumber={courseNumber}
      number={number}
    />
  </div>
  // return <div className={styles.root}>
  //   <ClassCard
  //     year={year}
  //     semester={semester}
  //     subject={subject}
  //     courseNumber={courseNumber}
  //     number={number}
  //   />
  // </div>
  // const { data, loading } = useReadClass(
  //   year as number,
  //   semester as Semester,
  //   subject as string,
  //   courseNumber as string,
  //   number as string
  // );

  // const _class = useMemo(() => data, [data]);

  // return loading || !_class ? (
  //   <></>
  // ) : (
  //   <ClassDrawer
  //     year={year}
  //     semester={semester}
  //     subject={subject}
  //     courseNumber={courseNumber}
  //     number={number}
  //   >
  //     <div className={styles.root}>
  //       <div className={styles.text}>
  //         <p className={styles.heading}>
  //           {_class.subject} {_class.courseNumber} #{_class.number}
  //         </p>
  //         <p className={styles.description}>
  //           {_class.title ?? _class.course.title}
  //         </p>
  //         <div className={styles.row}>
  //           <AverageGrade gradeDistribution={_class.gradeDistribution} />
  //           <Capacity
  //             enrollCount={_class.primarySection.enrollCount}
  //             enrollMax={_class.primarySection.enrollMax}
  //             waitlistCount={_class.primarySection.waitlistCount}
  //             waitlistMax={_class.primarySection.waitlistMax}
  //           />
  //           <Units unitsMin={_class.unitsMin} unitsMax={_class.unitsMax} />
  //         </div>
  //       </div>
  //       <div className={styles.column}>
  //         <div className={styles.icon}>
  //           <ArrowRight />
  //         </div>
  //       </div>
  //     </div>
  //   </ClassDrawer>
  // );
}
