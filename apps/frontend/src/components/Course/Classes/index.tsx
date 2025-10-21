import ClassCard from "@/components/ClassCard";
import useCourse from "@/hooks/useCourse";
import { sortByTermDescending } from "@/lib/classes";

import styles from "./Classes.module.scss";

export default function Classes() {
  const { course } = useCourse();
  console.log(course.classes);

  // TODO: UI and drawer vs. link for classes depending on dialog state
  return (
    <div className={styles.root}>
      {course.classes &&
        course.classes.toSorted(sortByTermDescending).map((_class, index) => (
          <div key={index} className={styles.row}>
            <div className={styles.term}>
              {_class.semester} {_class.year}
            </div>
            <ClassCard
              class={{
                ..._class,
                course: course,
              }}
            />
          </div>
        ))}
    </div>
  );
}
