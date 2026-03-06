import { useState } from "react";

import { motion } from "framer-motion";
import {
  BookStack,
  EditPencil,
  InfoCircle,
  Pin,
  PinSlash,
  PinSolid,
  Plus,
  Trash,
} from "iconoir-react";

import { Color } from "@repo/theme";

import {
  BubbleCard,
  MenuItem,
  springTransition,
} from "@/components/BubbleCard";
import { ColorDot } from "@/components/ColorDot";
import {
  COLLECTION_COLORS,
  capitalizeColor,
  getColorCSSVar,
} from "@/lib/colors";
import { getLetterGradeFromGPA } from "@/lib/grades";
import { CollectionPreviewClass } from "@/types/collection";

// eslint-disable-next-line css-modules/no-unused-class
import styles from "./CollectionCard.module.scss";

interface CollectionCardProps {
  name: string;
  classCount: number;
  isPinned?: boolean;
  isSystem?: boolean;
  color?: Color | null;
  previewClasses?: CollectionPreviewClass[];
  onPin?: (isPinned: boolean) => void;
  onRename?: () => void;
  onColorChange?: (color: Color | null) => void;
  onDelete?: () => void;
  onClick?: () => void;
}

function formatEnrollment(
  enrolled: number | null,
  max: number | null
): string | null {
  if (enrolled === null || max === null || max === 0) return null;
  const pct = Math.round((enrolled / max) * 100);
  return `${pct}% enrolled`;
}

function formatUnits(min: number, max: number): string {
  if (min === max) {
    return `${min} ${min === 1 ? "unit" : "units"}`;
  }
  return `${min}-${max} units`;
}

interface TiltedCardContentProps {
  classData: CollectionPreviewClass;
}

function TiltedCardContent({ classData }: TiltedCardContentProps) {
  const grade =
    classData.gradeAverage !== null
      ? getLetterGradeFromGPA(classData.gradeAverage)
      : null;
  const enrollment = formatEnrollment(
    classData.enrolledCount,
    classData.maxEnroll
  );
  const units = formatUnits(classData.unitsMin, classData.unitsMax);

  return (
    <div className={styles.cardContent}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>
          {classData.subject} {classData.courseNumber}
        </span>
        {grade && <span className={styles.cardGrade}>{grade}</span>}
      </div>
      <p className={styles.cardDescription}>{classData.title || "Untitled"}</p>
      <div className={styles.cardFooter}>
        {enrollment && (
          <span className={`${styles.cardPill} ${styles.enrolled}`}>
            {enrollment}
          </span>
        )}
        <span className={styles.cardPill}>{units}</span>
        {classData.hasReservedSeats && (
          <span className={styles.reserved}>
            <InfoCircle className={styles.reservedIcon} />
            Rsvd
          </span>
        )}
      </div>
    </div>
  );
}

export function CollectionCard({
  name,
  classCount,
  isPinned = false,
  isSystem = false,
  color = null,
  previewClasses = [],
  onPin,
  onRename,
  onColorChange,
  onDelete,
  onClick,
}: CollectionCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const handlePinToggle = () => {
    onPin?.(!isPinned);
  };

  const topClass = previewClasses[0];
  const secondClass = previewClasses[1];
  const showCards = previewClasses.length > 0;
  const isSingleCard = previewClasses.length === 1;

  // Build menu items array
  const menuItems: MenuItem[] = [];

  if (!isSystem) {
    menuItems.push({
      name: isPinned ? "Unpin collection" : "Pin collection",
      icon: isPinned ? (
        <PinSlash width={18} height={18} />
      ) : (
        <Pin width={18} height={18} />
      ),
      onClick: handlePinToggle,
    });

    menuItems.push({
      name: "Rename collection",
      icon: <BookStack width={18} height={18} />,
      onClick: onRename,
    });
  }

  // Color submenu
  const colorSubItems: MenuItem[] = [
    {
      name: "No color",
      icon: <ColorDot color={null} />,
      onClick: () => onColorChange?.(null),
    },
    ...COLLECTION_COLORS.map((c) => ({
      name: capitalizeColor(c),
      icon: <ColorDot color={c} />,
      onClick: () => onColorChange?.(c),
    })),
  ];

  menuItems.push({
    name: "Edit color",
    icon: <EditPencil width={18} height={18} />,
    subItems: colorSubItems,
  });

  if (!isSystem) {
    menuItems.push({
      name: "Delete collection",
      icon: <Trash width={18} height={18} />,
      onClick: onDelete,
      isDelete: true,
    });
  }

  const title = (
    <>
      {(isPinned || isSystem) && <PinSolid width={14} height={14} />}
      <span>{name}</span>
    </>
  );

  const description =
    classCount === 0 ? "No class added" : `${classCount} classes`;

  return (
    <BubbleCard
      title={title}
      description={description}
      cssColor={getColorCSSVar(color)}
      childrenPadding={true}
      menuItems={menuItems}
      onClick={onClick}
      showCards={showCards}
      isHovered={isHovered}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      width={420}
      height={230}
    >
      {isSingleCard && topClass ? (
        <motion.div
          className={styles.singleCard}
          animate={{ top: isHovered ? 32 : 45 }}
          transition={springTransition}
          style={{ zIndex: 2 }}
        >
          <TiltedCardContent classData={topClass} />
        </motion.div>
      ) : (
        <>
          {topClass && (
            <motion.div
              className={styles.stackedCard}
              animate={{
                top: isHovered ? 35 : 40,
                left: 25,
                rotate: isHovered ? -3 : -3.5,
              }}
              transition={springTransition}
              style={{ zIndex: 2 }}
            >
              <TiltedCardContent classData={topClass} />
            </motion.div>
          )}
          {secondClass && (
            <motion.div
              className={styles.stackedCard}
              animate={{
                top: isHovered ? 30 : 20,
                left: isHovered ? 50 : 42,
                rotate: isHovered ? 5 : 2.5,
              }}
              transition={springTransition}
              style={{ zIndex: 1 }}
            >
              <TiltedCardContent classData={secondClass} />
            </motion.div>
          )}
        </>
      )}
    </BubbleCard>
  );
}

interface AddCollectionCardProps {
  onClick?: () => void;
}

export function AddCollectionCard({ onClick }: AddCollectionCardProps) {
  return (
    <div className={styles.addCard} onClick={onClick}>
      <Plus className={styles.addIcon} />
    </div>
  );
}
