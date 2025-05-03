import classNames from "classnames";

import CCN from "@/components/CCN";
import Time from "@/components/Time";
import { ISection } from "@/lib/api";

import styles from "./Section.module.scss";
import useSchedule from "@/hooks/useSchedule";

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
  sectionId,
  number,
  meetings: [{ startTime, endTime, days }],
}: SectionProps & ISection) {

  return (
    <div
      className={classNames(styles.root, {
        [styles.active]: active,
      })}
      key={sectionId}
      onClick={() => onSectionSelect?.()}
      onMouseOver={() => onSectionMouseOver()}
      onMouseOut={() => onSectionMouseOut()}
    >
      <div className={styles.radioButton} />
      <p className={styles.title}>{number}</p>
      <CCN sectionId={sectionId} tooltip={false} />
      <Time
        endTime={endTime}
        startTime={startTime}
        days={days}
        tooltip={false}
        className={styles.time}
      />
    </div>
  );
}
