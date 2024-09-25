import { useMemo } from "react";

import { useQuery } from "@apollo/client";

import Details from "@/components/Details";
import { GET_CLASS, IClass } from "@/lib/api";

import useClass from "../useClass";
import styles from "./Overview.module.scss";

export default function Overview() {
  const { subject, courseNumber, classNumber, semester, year } = useClass();

  // TODO: Handle loading state
  const { data } = useQuery<{ class: IClass }>(GET_CLASS, {
    variables: {
      term: {
        semester,
        year,
      },
      subject,
      courseNumber,
      classNumber,
    },
  });

  // Because Overview will only be rendered when data loaded, we do
  // not need to worry about loading or error states for right now
  const _class = useMemo(() => data?.class as IClass, [data]);

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
