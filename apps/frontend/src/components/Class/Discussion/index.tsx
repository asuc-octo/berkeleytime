import Details from "@/components/Details";
import useClass from "@/hooks/useClass";

import styles from "./Discussion.module.scss";

export default function Discussion() {
  const { class: _class } = useClass();

  return (
    <div className={styles.root}>
      <Details {..._class.primarySection.meetings[0]} />
      <p className={styles.label}>Description</p>
      <p className={styles.description}>
        {_class.description ?? _class.course.description}
      </p>
      {_class.course.requirements && (
        <>
          <p className={styles.label}>Prerequisites</p>
          <p className={styles.description}>{_class.course.requirements}</p>
        </>
      )}
    </div>
  );
}
