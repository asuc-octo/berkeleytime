import { useMemo } from "react";

import { Lock, User } from "iconoir-react";
import { Tooltip } from "radix-ui";

import { ISeatReservationType } from "@/lib/api";

import styles from "./Capacity.module.scss";

export const getEnrollmentColor = (count?: number, capacity?: number) => {
  if (typeof count !== "number" || typeof capacity !== "number")
    return "var(--paragraph-color)";

  const percentage = count / capacity;

  return percentage >= 0.75
    ? "var(--rose-500)"
    : percentage > 0.5
      ? "var(--amber-500)"
      : "var(--emerald-500)";
};

const getProgressClass = (current?: number, total?: number) => {
  if (typeof current !== "number" || typeof total !== "number" || total === 0) {
    return "low";
  }

  const percentage = current / total;

  if (percentage >= 0.9) return "high";
  if (percentage >= 0.75) return "medium";
  return "low";
};

interface CapacityProps {
  enrolledCount?: number;
  maxEnroll?: number;
  waitlistedCount?: number;
  maxWaitlist?: number;
  reservedCount?: number;
  openReserved?: number;
  seatReservationTypes?: ISeatReservationType[];
}

export default function Capacity({
  enrolledCount,
  maxEnroll,
  waitlistedCount,
  maxWaitlist,
  seatReservationTypes,
}: CapacityProps) {
  const color = useMemo(
    () => getEnrollmentColor(enrolledCount, maxEnroll),
    [enrolledCount, maxEnroll]
  );

  const hasReservations = useMemo(
    () => seatReservationTypes && seatReservationTypes.length > 0,
    [seatReservationTypes]
  );

  const reservationCount = useMemo(
    () => seatReservationTypes?.length ?? 0,
    [seatReservationTypes]
  );

  return (
    <Tooltip.Root disableHoverableContent>
      <Tooltip.Trigger asChild>
        <div className={styles.trigger}>
          <User />
          <p className={styles.text}>
            <span style={{ color }}>
              {enrolledCount?.toLocaleString() ?? " - "}
            </span>
            &nbsp;/&nbsp;
            {maxEnroll?.toLocaleString() ?? " - "}
          </p>
          {hasReservations && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                color: "var(--neutral-500)",
                fontWeight: 600,
              }}
            >
              <Lock style={{ width: 12, height: 12 }} />
              <span>{reservationCount}</span>
            </div>
          )}
        </div>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          asChild
          side="bottom"
          sideOffset={8}
          collisionPadding={8}
        >
          <div className={styles.content}>
            <Tooltip.Arrow className={styles.arrow} />

            {/* Enrollment Progress */}
            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span className={styles.label}>Enrollment</span>
                <span className={styles.value}>
                  {enrolledCount?.toLocaleString() ?? "—"}
                  &nbsp;/&nbsp;
                  {maxEnroll?.toLocaleString() ?? "—"}
                  &nbsp; (
                  {enrolledCount === undefined || maxEnroll === undefined
                    ? "N/A"
                    : maxEnroll === 0
                      ? "0"
                      : Math.round(
                          (enrolledCount / maxEnroll) * 100
                        ).toLocaleString()}
                  %)
                </span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={`${styles.progressFill} ${styles[getProgressClass(enrolledCount, maxEnroll)]}`}
                  style={{
                    width:
                      enrolledCount && maxEnroll && maxEnroll > 0
                        ? `${Math.min((enrolledCount / maxEnroll) * 100, 100)}%`
                        : "0%",
                  }}
                />
              </div>
            </div>

            {/* Waitlist Progress */}
            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span className={styles.label}>Waitlist</span>
                <span className={styles.value}>
                  {waitlistedCount?.toLocaleString() ?? "—"}
                  &nbsp;/&nbsp;
                  {maxWaitlist?.toLocaleString() ?? "—"}
                  &nbsp; (
                  {waitlistedCount === undefined || maxWaitlist === undefined
                    ? "N/A"
                    : maxWaitlist === 0
                      ? "0"
                      : Math.round(
                          (waitlistedCount / maxWaitlist) * 100
                        ).toLocaleString()}
                  %)
                </span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={`${styles.progressFill} ${styles[getProgressClass(waitlistedCount, maxWaitlist)]}`}
                  style={{
                    width:
                      waitlistedCount && maxWaitlist && maxWaitlist > 0
                        ? `${Math.min((waitlistedCount / maxWaitlist) * 100, 100)}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
            {hasReservations && (
              <>
                <div className={styles.divider} />
                <div style={{ marginBottom: "8px" }}>
                  <div
                    className={styles.key}
                    style={{
                      fontSize: "13px",
                      marginBottom: "10px",
                    }}
                  >
                    Reserved Groups ({reservationCount})
                  </div>
                  {seatReservationTypes?.map((reservation) => {
                    // Simple abbreviation for the super long EECS name
                    let shortName = reservation.requirementGroup;
                    if (
                      shortName.includes(
                        "Electrical Engineering and Computer Sciences"
                      )
                    ) {
                      shortName = "EECS/CS Majors";
                    }
                    // Keep other names as-is for now

                    return (
                      <div
                        key={reservation.number}
                        className={styles.row}
                        style={{
                          alignItems: "flex-start",
                          marginBottom: "4px",
                          fontSize: "12px",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 400,
                            flex: "1",
                            minWidth: 0,
                            lineHeight: "1.3",
                          }}
                        >
                          • {shortName}
                        </span>
                        <span
                          style={{
                            fontWeight: 600,
                            flexShrink: 0,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {reservation.openReserved} / {reservation.maxEnroll}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
