import { IInstructor } from "@/lib/api";

import Location from "../Location";
import Time from "../Time";
import styles from "./Details.module.scss";

interface DetailsProps {
  days: boolean[] | null;
  timeStart: string | null;
  timeEnd: string | null;
  location: string | null;
  instructors: IInstructor[] | null;
}

export default function Details({
  days,
  timeStart,
  timeEnd,
  location,
  instructors,
}: DetailsProps) {
  return (
    <div className={styles.root}>
      <div className={styles.column}>
        <p className={styles.title}>Time</p>
        <Time days={days} timeStart={timeStart} timeEnd={timeEnd} />
      </div>
      <div className={styles.divider} />
      <div className={styles.column}>
        <p className={styles.title}>Location</p>
        <Location location={location} />
      </div>
      <div className={styles.divider} />
      <div className={styles.column}>
        <p className={styles.title}>
          {instructors && instructors?.length > 1
            ? "Instructors"
            : "Instructor"}
        </p>
        <p
          className={styles.description}
          style={{
            WebkitLineClamp: 2,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
          }}
        >
          {instructors?.[0]
            ? instructors.length === 1
              ? `${instructors[0].givenName} ${instructors[0].familyName}`
              : `${instructors[0].givenName} ${instructors[0].familyName}, et al.`
            : "To be determined"}
        </p>
      </div>
    </div>
  );
}
