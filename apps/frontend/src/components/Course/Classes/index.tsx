import ClassCard from "@/components/ClassCard";
import useCourse from "@/hooks/useCourse";
import { sortDescendingTerm } from "@/lib/classes";

import styles from "./Classes.module.scss";

export default function Classes() {
  const { course } = useCourse();

  console.log(course.classes);

  return (
    <div className={styles.root}>
      {course.classes &&
        course.classes
          .toSorted(sortDescendingTerm((d) => d))
          .map((_class, index) => (
            <div key={index} className={styles.row}>
              <div className={styles.term}>
                {_class.semester} {_class.year}
              </div>
              <div className={styles.classCont}>
                <ClassCard
                  subject={course.subject}
                  semester={_class.semester}
                  year={_class.year}
                  courseNumber={course.number}
                  number={_class.number}
                />
              </div>
            </div>
          ))}
    </div>
  );
}
