import {
  ComponentPropsWithRef,
  useEffect,
  useRef,
  useState,
} from "react";

import { Bell, BellNotification, NavArrowDown } from "iconoir-react"; 

import { Card } from "@repo/theme";

import { AverageGrade } from "@/components/AverageGrade";
import { getEnrollmentColor } from "@/components/Capacity";
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
  const [tempThresholds, setTempThresholds] = useState<number[]>(thresholds);
  const popupRef = useRef<HTMLDivElement>(null);
  const bellIconRef = useRef<HTMLDivElement>(null);
  const isActive = thresholds.length > 0;

  useEffect(() => {
    setTempThresholds(thresholds);
  }, [thresholds]);



  const handleTempThresholdChange = (threshold: number, checked: boolean) => {
    setTempThresholds((prev) => {
      if (checked) {
        return [...prev, threshold].sort((a, b) => a - b);
      } else {
        return prev.filter((t) => t !== threshold);
      }
    });
  };

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        bellIconRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !bellIconRef.current.contains(event.target as Node)
      ) {
        if (tempThresholds.length === 0 && thresholds.length > 0) {
          setShowRemoveConfirmation(true);
          setShowPopup(false);
        } else {
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

  const enrolled = enrollment?.latest.enrolledCount ?? 0;
  const max = enrollment?.latest.maxEnroll ?? 0;
  const enrollmentPercentage = max > 0 ? Math.round((enrolled / max) * 100) : 0;
  const enrollmentColor = getEnrollmentColor(enrolled, max);

  return (
    <div className={`${styles.cardWrapper} ${showPopup ? styles.popupOpen : ''}`}>
      <Card.RootColumn {...props}>
        <Card.ColumnHeader style={{ height: '100%' }}>
          <Card.Body style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: '16px', paddingRight: '16px' }}>
            <div>
              <Card.Heading className={styles.cardHeading}>
                {subject ?? courseSubject} {courseNumber ?? courseNumber2}
                <span className={styles.sectionNumber}> #{number}</span>
              </Card.Heading>
              <Card.Description className={styles.description}>{title ?? courseTitle}</Card.Description>
            </div>
            {/* --- Footer with Enrollment and Units --- */}
            <Card.Footer style={{ marginTop: '12px', marginBottom: '0', whiteSpace: 'nowrap' }}>
              <span className={styles.enrollmentText} style={{ color: enrollmentColor }}>
                {enrollmentPercentage}% enrolled
              </span>
              <Units unitsMin={unitsMin} unitsMax={unitsMax} />
            </Card.Footer>
          </Card.Body>
          <Card.Actions style={{ float: 'right' }}>
            {/* --- AverageGrade Pill --- */}
            {gradeDistribution && (
            <div className={styles.gradeWrapper}>
              <AverageGrade
                gradeDistribution={gradeDistribution}
              />
            </div>
            )}
            <div
              ref={bellIconRef}
              className={`${styles.bellWrapper} ${isActive ? styles.active : ''}`}
              onClick={() => setShowPopup(!showPopup)}
            >
              {isActive ? (
                <>
                  <BellNotification width={16} height={16} style={{ fill: 'var(--blue-500)' }} />
                  <NavArrowDown width={14} height={14} strokeWidth={2.5} style={{ color: 'var(--blue-500)' }}
                  className={showPopup ? styles.arrowRotated : ''}/>
                </>
              ) : (
                <Bell width={16} height={16} />
              )}
            </div>
            
            {showPopup && (
              <div
                ref={popupRef}
                className={styles.popup}
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
              </div>
            )}
            
          </Card.Actions>
        </Card.ColumnHeader>
      </Card.RootColumn>
      <RemoveClassPopup
        isOpen={showRemoveConfirmation}
        onClose={() => {
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