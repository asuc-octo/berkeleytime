import classNames from "classnames";

import CCN from "@/components/CCN";
import Time from "@/components/Time";
import { ISection } from "@/lib/api";

import styles from "./Section.module.scss";

interface SectionProps {
  onSectionSelect?: () => void;
  onSectionMouseOver: () => void;
  onSectionMouseOut: () => void;
  active: boolean;
}

export default function Section({
  onSectionSelect,
  onSectionMouseOver,
  onSectionMouseOut,
  active,
  ccn,
  number,
  timeEnd,
  timeStart,
  days,
  instructors,
}: SectionProps & ISection) {
  return (
    <div
      className={classNames(styles.root, {
        [styles.active]: active,
      })}
      key={ccn}
      onClick={() => onSectionSelect?.()}
      onMouseOver={() => onSectionMouseOver()}
      onMouseOut={() => onSectionMouseOut()}
    >
      <div className={styles.radioButton} />
      <div className={styles.text}>
        <div className={styles.row}>
          <p className={styles.title}>{number}</p>
          <CCN ccn={ccn} />
        </div>
        <div className={styles.row}>
          <Time timeEnd={timeEnd} timeStart={timeStart} days={days} />
        </div>
        <div className={styles.row}>
          {instructors && instructors.length > 0
            ? `${instructors[0].givenName} ${instructors[0].familyName}`
            : "To be determined"}
        </div>
      </div>
    </div>
  );
}
