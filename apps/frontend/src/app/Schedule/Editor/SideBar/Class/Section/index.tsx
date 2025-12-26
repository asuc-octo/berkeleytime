import classNames from "classnames";
import { Eye, EyeClosed } from "iconoir-react";

import { Tooltip } from "@repo/theme";

import CCN from "@/components/CCN";
import Time from "@/components/Time";
import { IScheduleClass } from "@/lib/api";

import styles from "./Section.module.scss";

interface SectionProps {
  onSectionSelect?: () => void;
  onSectionMouseOver: () => void;
  onSectionMouseOut: () => void;
  onBlockToggle?: () => void;
  active: boolean;
  blocked?: boolean;
  editing?: boolean;
}

export default function Section({
  onSectionSelect,
  onSectionMouseOver,
  onSectionMouseOut,
  onBlockToggle,
  active,
  blocked = false,
  editing = true,
  sectionId,
  number,
  meetings,
}: SectionProps & IScheduleClass["class"]["primarySection"]) {
  const meetingsAdjusted = meetings.length > 0 ? meetings : [null];
  return meetingsAdjusted.map((meeting) => (
    <div
      className={classNames(styles.root, {
        [styles.active]: active && !blocked,
        [styles.blocked]: blocked,
        [styles.noHover]: !editing,
      })}
      key={sectionId}
      onClick={(e) => {
        if (blocked) return;
        e.stopPropagation();
        onSectionSelect?.();
      }}
      onMouseOver={() => !blocked && onSectionMouseOver()}
      onMouseOut={() => !blocked && onSectionMouseOut()}
    >
      <div className={styles.radioButton} />
      <p className={styles.title}>{number}</p>
      <CCN sectionId={sectionId} tooltip={false} />
      <Time
        endTime={meeting?.endTime ?? null}
        startTime={meeting?.startTime ?? null}
        days={meeting?.days ?? null}
        className={styles.time}
      />
      {onBlockToggle && (
        <Tooltip
          trigger={
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBlockToggle();
              }}
              className={styles.blockButton}
              title={blocked ? "Exclude section" : "Include section"}
            >
              {blocked ? (
                <EyeClosed
                  width={14}
                  height={14}
                  color="var(--paragraph-color)"
                />
              ) : (
                <Eye width={14} height={14} color="var(--paragraph-color)" />
              )}
            </button>
          }
          title={blocked ? "Exclude section" : "Include section"}
        />
      )}
    </div>
  ));
}
