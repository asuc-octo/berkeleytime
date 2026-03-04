import { type ReactNode, type RefObject, useCallback, useEffect, useRef } from "react";

import { StatDown, StatUp } from "iconoir-react";

import type { CapacityChangeEvent } from "@/app/Enrollment/EnrollmentGraph.utils";

import { formatters } from "./utils";
import styles from "./CapacityChange.module.scss";

interface CapacityChangeTooltipResult {
  show: (event: CapacityChangeEvent, pos: { x: number; y: number }) => void;
  hide: () => void;
  element: ReactNode;
}

export function useCapacityChangeTooltip(
  chartRef: RefObject<HTMLDivElement | null>
): CapacityChangeTooltipResult {
  const anchorRef = useRef<HTMLDivElement>(null);
  const deltaRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const seatsRef = useRef<HTMLSpanElement>(null);

  const show = useCallback(
    (event: CapacityChangeEvent, pos: { x: number; y: number }) => {
      const anchor = anchorRef.current;
      const delta = deltaRef.current;
      const text = textRef.current;
      const chart = chartRef.current;
      if (!anchor || !delta || !text || !chart) return;

      const isIncrease = event.direction === "increase";
      const seatDelta = event.currentMaxEnroll - event.previousMaxEnroll;

      delta.className = `${styles.capacityChangeTooltipDelta} ${
        isIncrease
          ? styles.capacityChangeTooltipDeltaIncrease
          : styles.capacityChangeTooltipDeltaDecrease
      }`;

      const prefix = seatDelta > 0 ? "+" : "";
      const seatWord = Math.abs(seatDelta) === 1 ? "seat" : "seats";
      text.textContent = `${formatters.percent(event.percentChange, 0)} ${
        isIncrease ? "increase" : "decrease"
      } (${prefix}${formatters.number(seatDelta)} ${seatWord})`;

      if (seatsRef.current) {
        seatsRef.current.textContent = `${formatters.number(event.previousMaxEnroll)} → ${formatters.number(event.currentMaxEnroll)} seats`;
      }

      anchor.style.display = "";
      anchor.style.left = `${pos.x}px`;
      anchor.style.top = `${pos.y}px`;

      const gap = 20;
      anchor.style.transform = `translate(-50%, ${gap}px)`;

      const tooltipRect = anchor.getBoundingClientRect();
      const chartRect = chart.getBoundingClientRect();

      if (tooltipRect.bottom > chartRect.bottom) {
        anchor.style.transform = `translate(-50%, calc(-100% - ${gap}px))`;
      }

      const adjustedRect = anchor.getBoundingClientRect();
      const overflowRight = adjustedRect.right - chartRect.right;
      const overflowLeft = chartRect.left - adjustedRect.left;

      if (overflowRight > 0) {
        anchor.style.left = `${pos.x - overflowRight - 4}px`;
      } else if (overflowLeft > 0) {
        anchor.style.left = `${pos.x + overflowLeft + 4}px`;
      }
    },
    // chartRef is a stable ref object
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const hide = useCallback(() => {
    const anchor = anchorRef.current;
    if (anchor) anchor.style.display = "none";
  }, []);

  useEffect(() => {
    hide();
  }, [hide]);

  const element: ReactNode = (
    <div
      ref={anchorRef}
      className={styles.capacityTooltipAnchor}
      style={{ display: "none" }}
    >
      <div className={`${styles.tooltipCard} ${styles.capacityTooltipCard}`}>
        <div
          className={`${styles.tooltipLabel} ${styles.capacityTooltipLabel}`}
        >
          Seating capacity changed
        </div>
        <div
          className={`${styles.tooltipItems} ${styles.capacityTooltipItems}`}
        >
          <span ref={deltaRef} className={styles.capacityChangeTooltipDelta}>
            <StatUp
              className={`${styles.capacityChangeTooltipIcon} ${styles.tooltipIconUp}`}
              width={14}
              height={14}
            />
            <StatDown
              className={`${styles.capacityChangeTooltipIcon} ${styles.tooltipIconDown}`}
              width={14}
              height={14}
            />
            <span ref={textRef} />
          </span>
          <span ref={seatsRef} className={styles.capacityChangeTooltipSeats} />
        </div>
      </div>
    </div>
  );

  return { show, hide, element };
}
