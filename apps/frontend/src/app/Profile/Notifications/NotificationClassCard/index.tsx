import { ComponentPropsWithRef, useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

import { Bookmark, BookmarkSolid, Bell, BellNotification, NavArrowDown } from "iconoir-react";

import { Card } from "@repo/theme";

import { AverageGrade } from "@/components/AverageGrade";
import Capacity from "@/components/Capacity";
import Units from "@/components/Units";
import { IClass } from "@/lib/api";

import { RemoveClassPopup } from "../ConfirmationPopups";
import styles from "./NotificationClassCard.module.scss";

interface NotificationClassCardProps {
  class: IClass;
  thresholds: number[];
  onThresholdChange: (threshold: number, checked: boolean) => void;
  onRemoveClass: () => Promise<void>;
  bookmarked?: boolean;
  bookmarkToggle?: () => void;
}

export default function NotificationClassCard({
  class: {
    course: {
      title: courseTitle,
      subject: courseSubject,
      number: courseNumber2,
      gradeDistribution,
    },
    title,
    subject,
    courseNumber,
    number,
    primarySection: { enrollment },
    unitsMax,
    unitsMin,
  },
  thresholds,
  onThresholdChange,
  onRemoveClass,
  bookmarked = false,
  bookmarkToggle,
  ...props
}: NotificationClassCardProps & Omit<ComponentPropsWithRef<"div">, keyof NotificationClassCardProps>) {
  const [showPopup, setShowPopup] = useState(false);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [tempThresholds, setTempThresholds] = useState<number[]>(thresholds);
  const popupRef = useRef<HTMLDivElement>(null);
  const bellIconRef = useRef<HTMLDivElement>(null);
  const isActive = thresholds.length > 0;

  // Sync temp thresholds with prop changes
  useEffect(() => {
    setTempThresholds(thresholds);
  }, [thresholds]);

  // Update popup position when it opens
  useEffect(() => {
    if (showPopup && bellIconRef.current) {
      const rect = bellIconRef.current.getBoundingClientRect();
      const popupWidth = 280; // min-width from CSS
      const viewportWidth = window.innerWidth;
      const spaceOnRight = viewportWidth - rect.left;

      // If popup would overflow the right edge, align it to the right edge
      const shouldAlignRight = spaceOnRight < popupWidth;

      setPopupPosition({
        top: rect.top + 20, // 20px below the icon
        left: shouldAlignRight ? viewportWidth - popupWidth - 16 : rect.left, // 16px padding from edge
      });
    }
  }, [showPopup]);

  // Handle threshold change with temp state
  const handleTempThresholdChange = (threshold: number, checked: boolean) => {
    setTempThresholds((prev) => {
      if (checked) {
        return [...prev, threshold].sort((a, b) => a - b);
      } else {
        return prev.filter((t) => t !== threshold);
      }
    });
  };

  // Apply threshold changes
  const applyThresholdChanges = () => {
    tempThresholds.forEach((threshold) => {
      if (!thresholds.includes(threshold)) {
        onThresholdChange(threshold, true);
      }
    });
    thresholds.forEach((threshold) => {
      if (!tempThresholds.includes(threshold)) {
        onThresholdChange(threshold, false);
      }
    });
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        bellIconRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !bellIconRef.current.contains(event.target as Node)
      ) {
        // Check if user unchecked all options
        if (tempThresholds.length === 0 && thresholds.length > 0) {
          setShowRemoveConfirmation(true);
          setShowPopup(false);
        } else {
          // Apply changes
          applyThresholdChanges();
          setShowPopup(false);
        }
      }
    };

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup, tempThresholds, thresholds, onThresholdChange]);

  return (
    <div className={`${styles.cardWrapper} ${showPopup ? styles.popupOpen : ''}`}>
      <Card.RootColumn {...props}>
        <Card.ColumnHeader style={{ height: '100%' }}>
          <Card.Body style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: '4px' }}>
            <div>
              <Card.Heading>
                {subject ?? courseSubject} {courseNumber ?? courseNumber2} #{number}
              </Card.Heading>
              <Card.Description>{title ?? courseTitle}</Card.Description>
            </div>
            <Card.Footer style={{ marginTop: '0', marginBottom: '0', whiteSpace: 'nowrap' }}>
              <Capacity
                enrolledCount={enrollment?.latest.enrolledCount}
                maxEnroll={enrollment?.latest.maxEnroll}
                waitlistedCount={enrollment?.latest.waitlistedCount}
                maxWaitlist={enrollment?.latest.maxWaitlist}
              />
              <Units unitsMin={unitsMin} unitsMax={unitsMax} />
            </Card.Footer>
          </Card.Body>
          <Card.Actions>
            {gradeDistribution && (
            <AverageGrade
              gradeDistribution={gradeDistribution}
              style={{ marginTop: 0.5, fontSize: 15 }}
            />
            )}
            {bookmarkToggle && (
            <Card.ActionIcon onClick={bookmarkToggle}>
              {bookmarked ? (
                <BookmarkSolid width={16} height={16} style={{ color: 'var(--blue-500)' }} />
              ) : (
                <Bookmark width={16} height={16} />
              )}
            </Card.ActionIcon>
            )}
            <div
              ref={bellIconRef}
              className={`${styles.bellWrapper} ${isActive ? styles.active : ''}`}
              onClick={() => setShowPopup(!showPopup)}
            >
              {isActive ? (
                <>
                  <BellNotification width={16} height={16} style={{ fill: 'var(--blue-500)' }} />
                  <NavArrowDown width={14} height={14} strokeWidth={2.5} style={{ color: 'var(--blue-500)' }} />
                </>
              ) : (
                <Bell width={16} height={16} />
              )}
            </div>
            {showPopup && createPortal(
              <div
                ref={popupRef}
                className={styles.popup}
                style={{
                  position: 'fixed',
                  top: `${popupPosition.top}px`,
                  left: `${popupPosition.left}px`,
                }}
              >
                <label className={styles.checkboxOption}>
                  <input
                    type="checkbox"
                    checked={tempThresholds.includes(50)}
                    onChange={(e) => handleTempThresholdChange(50, e.target.checked)}
                  />
                  <span>When 50% full</span>
                </label>
                <label className={styles.checkboxOption}>
                  <input
                    type="checkbox"
                    checked={tempThresholds.includes(75)}
                    onChange={(e) => handleTempThresholdChange(75, e.target.checked)}
                  />
                  <span>When 75% full</span>
                </label>
                <label className={styles.checkboxOption}>
                  <input
                    type="checkbox"
                    checked={tempThresholds.includes(90)}
                    onChange={(e) => handleTempThresholdChange(90, e.target.checked)}
                  />
                  <span>When 90% full</span>
                </label>
                <label className={styles.checkboxOption}>
                  <input
                    type="checkbox"
                    checked={tempThresholds.includes(100)}
                    onChange={(e) => handleTempThresholdChange(100, e.target.checked)}
                  />
                  <span>When an unreserved seat opens</span>
                </label>
                <label className={styles.checkboxOption}>
                  <input
                    type="checkbox"
                  />
                  <span>When my waitlist position improves</span>
                </label>
                <label className={styles.checkboxOption}>
                  <input
                    type="checkbox"
                  />
                  <span>When there is space to join the waitlist</span>
                </label>
              </div>,
              document.body
            )}
          </Card.Actions>
        </Card.ColumnHeader>
      </Card.RootColumn>
      <RemoveClassPopup
        isOpen={showRemoveConfirmation}
        onClose={() => {
          // User changed their mind, restore previous thresholds
          setTempThresholds(thresholds);
          setShowRemoveConfirmation(false);
        }}
        onConfirmRemove={async () => {
          await onRemoveClass();
          setShowRemoveConfirmation(false);
        }}
      />
    </div>
  );
}
