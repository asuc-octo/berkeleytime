import { ArrowUpCircle } from "iconoir-react/solid";

import type { CapacityChangeEvent } from "@/app/Enrollment/EnrollmentGraph.utils";

// eslint-disable-next-line css-modules/no-unused-class -- classes shared with CapacityChangeTooltip
import styles from "./CapacityChange.module.scss";

const MARKER_SIZE = 5;
const VERTICAL_OFFSET = 5;
const HIT_RADIUS = 8;

export interface CapacityChangeMarkerProps {
  cx: number;
  cy: number;
  event: CapacityChangeEvent;
  color: string;
  onMouseEnter: (
    event: CapacityChangeEvent,
    pos: { x: number; y: number }
  ) => void;
  onMouseLeave: () => void;
}

export function CapacityChangeMarker({
  cx,
  cy,
  event,
  color,
  onMouseEnter,
  onMouseLeave,
}: CapacityChangeMarkerProps) {
  const iconSize = MARKER_SIZE * 5;
  const iconCenterY = cy + VERTICAL_OFFSET + iconSize / 2;

  return (
    <g
      className={styles.capacityMarker}
      onMouseEnter={() => onMouseEnter(event, { x: cx, y: iconCenterY })}
      onMouseLeave={onMouseLeave}
    >
      <circle cx={cx} cy={iconCenterY} r={HIT_RADIUS} fill="transparent" />
      <circle
        cx={cx}
        cy={iconCenterY}
        r={iconSize / 2 + 2}
        fill="var(--background-color)"
        stroke="var(--border-color)"
        strokeWidth={1}
      />
      <ArrowUpCircle
        width={iconSize}
        height={iconSize}
        x={cx - iconSize / 2}
        y={iconCenterY - iconSize / 2}
        color={color}
      />
    </g>
  );
}
