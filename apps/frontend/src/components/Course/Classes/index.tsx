import ClassCard from "@/components/ClassCard";
import useCourse from "@/hooks/useCourse";

import styles from "./Classes.module.scss";

export default function Classes() {
  const { course } = useCourse();

  return (
    <div className={styles.root}>
      {course.classes &&
        course.classes.map((_class, index) => (
          <div key={index} className={styles.row}>
            <div className={styles.term}>
              {_class.semester} {_class.year}
            </div>
            <ClassCard
              subject={course.subject}
              semester={_class.semester}
              year={_class.year}
              courseNumber={course.number}
              number={_class.number}
            />
          </div>
        ))}
    </div>
  );
}
