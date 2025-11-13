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
  sectionId,
  number,
  meetings,
}: SectionProps & ISection) {
  const meetingsAdjusted = meetings.length > 0 ? meetings : [null];
  return meetingsAdjusted.map((meeting) => (
    <div
      className={classNames(styles.root, {
        [styles.active]: active,
      })}
      key={sectionId}
      onClick={(e) => {
        e.stopPropagation();
        onSectionSelect?.();
      }}
      onMouseOver={() => onSectionMouseOver()}
      onMouseOut={() => onSectionMouseOut()}
    >
      <div className={styles.radioButton} />
      <p className={styles.title}>{number}</p>
      <CCN sectionId={sectionId} tooltip={false} />
      <Time
        endTime={meeting?.endTime ?? null}
        startTime={meeting?.startTime ?? null}
        days={meeting?.days ?? null}
        tooltip={false}
        className={styles.time}
      />
    </div>
  ));
}
