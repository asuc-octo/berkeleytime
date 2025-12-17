import { InfoCircle } from "iconoir-react";
import { HoverCard } from "radix-ui";

import { Badge, Color } from "@repo/theme";

import styles from "./ReservedSeatingHoverCard.module.scss";

interface SeatReservation {
  enrolledCount: number;
  maxEnroll: number;
  requirementGroup: {
    description: string;
  };
  isValid: boolean;
}

interface ReservedSeatingHoverCardProps {
  seatReservationCount: SeatReservation[];
}

export function ReservedSeatingHoverCard({
  seatReservationCount,
}: ReservedSeatingHoverCardProps) {
  const validReservations = seatReservationCount
    .filter((r) => r.isValid)
    .sort((a, b) => {
      const aFull = a.enrolledCount >= a.maxEnroll;
      const bFull = b.enrolledCount >= b.maxEnroll;

      // First, sort by full status (not full first, then full)
      if (aFull !== bFull) {
        return aFull ? 1 : -1;
      }

      // Within each group, sort by maxEnroll descending
      return b.maxEnroll - a.maxEnroll;
    });

  return (
    <HoverCard.Root openDelay={200} closeDelay={100}>
      <HoverCard.Trigger asChild>
        <div className={styles.trigger}>
          <Badge
            label="Reserved Seating"
            color={Color.Orange}
            icon={<InfoCircle />}
          />
        </div>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          side="bottom"
          align="start"
          sideOffset={8}
          className={styles.card}
        >
          <div className={styles.header}>This class has reserved seating</div>
          <div className={styles.content}>
            {validReservations.map((reservation, index) => {
              const isFull = reservation.enrolledCount >= reservation.maxEnroll;
              const pillClassName = isFull
                ? styles.pillFull
                : styles.pillAvailable;

              return (
                <div key={index} className={styles.group}>
                  <span className={styles.description}>
                    {reservation.requirementGroup.description}
                  </span>
                  <div className={styles.pillContainer}>
                    <div className={`${styles.pill} ${pillClassName}`}>
                      <span className={styles.pillText}>
                        {reservation.enrolledCount}/{reservation.maxEnroll}{" "}
                        enrolled
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
