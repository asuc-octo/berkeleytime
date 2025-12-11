import { useState } from "react";

import { motion } from "framer-motion";
import {
  BookStack,
  EditPencil,
  InfoCircle,
  MoreHoriz,
  NavArrowRight,
  Pin,
  PinSlash,
  PinSolid,
  Plus,
  Trash,
} from "iconoir-react";

import { Color, DropdownMenu, IconButton } from "@repo/theme";

import {
  COLLECTION_COLORS,
  capitalizeColor,
  getColorStyle,
} from "@/lib/colors";
import { getLetterGradeFromGPA } from "@/lib/grades";
import { CollectionPreviewClass } from "@/types/collection";

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
            Reserved
          </span>
        )}
      </div>
    </div>
  );
}

const springTransition = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30,
};

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

  const handlePinToggle = () => {
    onPin?.(!isPinned);
  };

  const topClass = previewClasses[0];
  const secondClass = previewClasses[1];
  const showCards = previewClasses.length > 0;
  const isSingleCard = previewClasses.length === 1;

  return (
    <div
      className={styles.root}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {color && (
        <div className={styles.colorBackground} style={getColorStyle(color)} />
      )}
      <div className={styles.cardsStack} style={{ opacity: showCards ? 1 : 0 }}>
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
                  left: 0,
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
                  left: isHovered ? 25 : 17,
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
      </div>
      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.collectionName}>
            {(isPinned || isSystem) && <PinSolid width={14} height={14} />}
            <span>{name}</span>
          </p>
          <p className={styles.classCount}>
            {classCount === 0 ? "No class added" : `${classCount} classes`}
          </p>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger asChild>
              <IconButton className={styles.menuButton}>
                <MoreHoriz />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content sideOffset={5} align="start">
              {!isSystem && (
                <DropdownMenu.Item onSelect={handlePinToggle}>
                  {isPinned ? (
                    <>
                      <PinSlash width={18} height={18} /> Unpin collection
                    </>
                  ) : (
                    <>
                      <Pin width={18} height={18} /> Pin collection
                    </>
                  )}
                </DropdownMenu.Item>
              )}
              {!isSystem && (
                <DropdownMenu.Item onSelect={onRename}>
                  <BookStack width={18} height={18} /> Rename collection
                </DropdownMenu.Item>
              )}
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger>
                  <EditPencil width={18} height={18} /> Edit color
                  <NavArrowRight
                    width={14}
                    height={14}
                    style={{ marginLeft: "auto" }}
                  />
                </DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent sideOffset={-2}>
                  <DropdownMenu.Item onSelect={() => onColorChange?.(null)}>
                    <span className={styles.colorDotOutline} /> No color
                  </DropdownMenu.Item>
                  {COLLECTION_COLORS.map((color) => (
                    <DropdownMenu.Item
                      key={color}
                      onSelect={() => onColorChange?.(color)}
                    >
                      <span
                        className={styles.colorDot}
                        style={getColorStyle(color)}
                      />{" "}
                      {capitalizeColor(color)}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.SubContent>
              </DropdownMenu.Sub>
              {!isSystem && (
                <DropdownMenu.Item isDelete onSelect={onDelete}>
                  <Trash width={18} height={18} /> Delete collection
                </DropdownMenu.Item>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
    </div>
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
