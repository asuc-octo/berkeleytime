import {
  ComponentPropsWithRef,
  useEffect,
  useRef,
  useState,
} from "react";

import { NavArrowDown, Check } from "iconoir-react"; 
import { Checkbox } from "radix-ui"; 
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
  
  const uniqueId = `${subject}-${number}`;

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
            <Card.Footer style={{ marginTop: '12px', marginBottom: '0', whiteSpace: 'nowrap' }}>
              <span className={styles.enrollmentText} style={{ color: enrollmentColor }}>
                {enrollmentPercentage}% enrolled
              </span>
              <Units unitsMin={unitsMin} unitsMax={unitsMax} />
            </Card.Footer>
          </Card.Body>
          <Card.Actions style={{ float: 'right' }}>
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
              
                  <CustomBellNotificationIcon width={16} height={16} /> 
                  <NavArrowDown width={14} height={14} strokeWidth={2.5} style={{ color: 'var(--blue-500)' }}
                  className={showPopup ? styles.arrowRotated : ''}/>
                </>
              ) : (
              
                <CustomBellIcon width={16} height={16} />
              )}
            </div>
            
            {showPopup && (
              <div
                ref={popupRef}
                className={styles.popup}
              >
                <div className={styles.checkboxOption}>
                  <Checkbox.Root
                    id={`${uniqueId}-50`}
                    className={styles.checkbox}
                    checked={tempThresholds.includes(50)}
                    onCheckedChange={(checked) => handleTempThresholdChange(50, checked as boolean)}
                  >
                    <Checkbox.Indicator asChild>
                      <Check width={12} height={12} />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <label htmlFor={`${uniqueId}-50`}>
                    <span>When 50% full</span>
                  </label>
                </div>

                <div className={styles.checkboxOption}>
                  <Checkbox.Root
                    id={`${uniqueId}-75`}
                    className={styles.checkbox}
                    checked={tempThresholds.includes(75)}
                    onCheckedChange={(checked) => handleTempThresholdChange(75, checked as boolean)}
                  >
                    <Checkbox.Indicator asChild>
                      <Check width={12} height={12} />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <label htmlFor={`${uniqueId}-75`}>
                    <span>When 75% full</span>
                  </label>
                </div>
                
                <div className={styles.checkboxOption}>
                  <Checkbox.Root
                    id={`${uniqueId}-90`}
                    className={styles.checkbox}
                    checked={tempThresholds.includes(90)}
                    onCheckedChange={(checked) => handleTempThresholdChange(90, checked as boolean)}
                  >
                    <Checkbox.Indicator asChild>
                      <Check width={12} height={12} />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <label htmlFor={`${uniqueId}-90`}>
                    <span>When 90% full</span>
                  </label>
                </div>
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

const CustomBellNotificationIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    width="24px" 
    height="24px" 
    viewBox="0 0 24 24" 
    strokeWidth="1.5" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    color="currentColor" // Use CSS color
    {...props}
  >
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M14.752 1.91434C14.1218 2.7805 13.75 3.84683 13.75 5C13.75 7.83971 16.0046 10.1528 18.8214 10.247C18.8216 10.2508 18.8219 10.2546 18.8222 10.2583C18.8369 10.4557 18.852 10.6591 18.8726 10.855C19.1087 13.1025 19.6495 14.6443 20.1679 15.6582C20.5132 16.3334 20.8519 16.781 21.0922 17.0516C21.2125 17.1871 21.3088 17.2788 21.3696 17.3328C21.4 17.3599 21.4216 17.3775 21.4329 17.3865L21.4416 17.3933C21.7027 17.5833 21.8131 17.9196 21.7147 18.2278C21.6154 18.5386 21.3265 18.7496 21.0002 18.7496L3.00005 18.75C2.67373 18.75 2.38485 18.539 2.28559 18.2281C2.18718 17.9199 2.29755 17.5837 2.55863 17.3937L2.56735 17.3869C2.57869 17.3779 2.60028 17.3602 2.63069 17.3332C2.69148 17.2792 2.7877 17.1875 2.90804 17.052C3.14835 16.7814 3.48701 16.3338 3.8323 15.6585C4.52142 14.3109 5.25005 12.0306 5.25005 8.4C5.25005 6.51876 5.95021 4.70561 7.21026 3.36156C8.47184 2.01587 10.1937 1.25 12.0001 1.25C12.3823 1.25 12.7613 1.28434 13.1331 1.35139C13.3707 1.39421 14.1514 1.63742 14.752 1.91434Z" 
      fill="currentColor" // Use CSS color
    />
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M15.25 5C15.25 2.92893 16.9289 1.25 19 1.25C21.0711 1.25 22.75 2.92893 22.75 5C22.75 7.07107 21.0711 8.75 19 8.75C16.9289 8.75 15.25 7.07107 15.25 5Z" 
      fill="currentColor" // Use CSS color
    />
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M9.89369 20.3514C10.252 20.1435 10.7109 20.2655 10.9188 20.6238C11.0287 20.8132 11.1864 20.9705 11.3761 21.0798C11.5659 21.1891 11.781 21.2466 12 21.2466C12.219 21.2466 12.4342 21.1891 12.6239 21.0798C12.8137 20.9705 12.9714 20.8132 13.0813 20.6238C13.2891 20.2655 13.7481 20.1435 14.1063 20.3514C14.4646 20.5592 14.5866 21.0182 14.3788 21.3765C14.137 21.7932 13.7901 22.1391 13.3726 22.3796C12.9551 22.62 12.4818 22.7466 12 22.7466C11.5183 22.7466 11.0449 22.62 10.6275 22.3796C10.21 22.1391 9.86301 21.7932 9.62127 21.3765C9.41343 21.0182 9.5354 20.5592 9.89369 20.3514Z" 
      fill="currentColor" // Use CSS color
    />
  </svg>
);

const CustomBellIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    width="24px" 
    height="24px" 
    viewBox="0 0 24 24" 
    strokeWidth="1.5" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    color="currentColor" // Use CSS color
    {...props}
  >
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M14.752 1.91434C14.1218 2.7805 13.75 3.84683 13.75 5C13.75 7.83971 16.0046 10.1528 18.8214 10.247C18.8216 10.2508 18.8219 10.2546 18.8222 10.2583C18.8369 10.4557 18.852 10.6591 18.8726 10.855C19.1087 13.1025 19.6495 14.6443 20.1679 15.6582C20.5132 16.3334 20.8519 16.781 21.0922 17.0516C21.2125 17.1871 21.3088 17.2788 21.3696 17.3328C21.4 17.3599 21.4216 17.3775 21.4329 17.3865L21.4416 17.3933C21.7027 17.5833 21.8131 17.9196 21.7147 18.2278C21.6154 18.5386 21.3265 18.7496 21.0002 18.7496L3.00005 18.75C2.67373 18.75 2.38485 18.539 2.28559 18.2281C2.18718 17.9199 2.29755 17.5837 2.55863 17.3937L2.56735 17.3869C2.57869 17.3779 2.60028 17.3602 2.63069 17.3332C2.69148 17.2792 2.7877 17.1875 2.90804 17.052C3.14835 16.7814 3.48701 16.3338 3.8323 15.6585C4.52142 14.3109 5.25005 12.0306 5.25005 8.4C5.25005 6.51876 5.95021 4.70561 7.21026 3.36156C8.47184 2.01587 10.1937 1.25 12.0001 1.25C12.3823 1.25 12.7613 1.28434 13.1331 1.35139C13.3707 1.39421 14.1514 1.63742 14.752 1.91434Z" 
      fill="currentColor" // Use CSS color
    />
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M9.89369 20.3514C10.252 20.1435 10.7109 20.2655 10.9188 20.6238C11.0287 20.8132 11.1864 20.9705 11.3761 21.0798C11.5659 21.1891 11.781 21.2466 12 21.2466C12.219 21.2466 12.4342 21.1891 12.6239 21.0798C12.8137 20.9705 12.9714 20.8132 13.0813 20.6238C13.2891 20.2655 13.7481 20.1435 14.1063 20.3514C14.4646 20.5592 14.5866 21.0182 14.3788 21.3765C14.137 21.7932 13.7901 22.1391 13.3726 22.3796C12.9551 22.62 12.4818 22.7466 12 22.7466C11.5183 22.7466 11.0449 22.62 10.6275 22.3796C10.21 22.1391 9.86301 21.7932 9.62127 21.3765C9.41343 21.0182 9.5354 20.5592 9.89369 20.3514Z" 
      fill="currentColor" // Use CSS color
    />
  </svg>
);