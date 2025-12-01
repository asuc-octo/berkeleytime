import { useState } from "react";

import { motion } from "framer-motion";
import {
  BookStack,
  EditPencil,
  MoreHoriz,
  Pin,
  PinSlash,
  PinSolid,
  Plus,
  Trash,
} from "iconoir-react";

import { DropdownMenu, IconButton } from "@repo/theme";

import styles from "./CollectionCard.module.scss";

interface CollectionCardProps {
  name: string;
  classCount: number;
  isPinned?: boolean;
  onPin?: (isPinned: boolean) => void;
  onRename?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}

const COLORS = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];

const springTransition = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30,
};

export function CollectionCard({
  name,
  classCount,
  isPinned = false,
  onPin,
  onRename,
  onDelete,
  onClick,
}: CollectionCardProps) {
  const [bgColor, setBgColor] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handlePinToggle = () => {
    onPin?.(!isPinned);
  };

  return (
    <div
      className={styles.root}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {bgColor && (
        <div className={styles.colorBackground} data-color={bgColor} />
      )}
      <div
        className={styles.cardsStack}
        style={{ opacity: classCount > 0 ? 1 : 0 }}
      >
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
          <div className={styles.cardContent}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>COM LIT 198BC</span>
              <span className={styles.cardGrade}>A</span>
            </div>
            <p className={styles.cardDescription}>Berkeley Connect</p>
            <div className={styles.cardFooter}>
              <span className={`${styles.cardPill} ${styles.enrolled}`}>
                100% enrolled
              </span>
              <span className={styles.cardPill}>4 units</span>
            </div>
          </div>
        </motion.div>
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
          <div className={styles.cardContent}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>COM LIT 198BC</span>
              <span className={styles.cardGrade}>A</span>
            </div>
            <p className={styles.cardDescription}>Berkeley Connect</p>
            <div className={styles.cardFooter}>
              <span className={`${styles.cardPill} ${styles.enrolled}`}>
                100% enrolled
              </span>
              <span className={styles.cardPill}>4 units</span>
            </div>
          </div>
        </motion.div>
      </div>
      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.collectionName}>
            {isPinned && (
              <PinSolid width={14} height={14} color="var(--blue-500)" />
            )}
            {name}
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
              <DropdownMenu.Item onSelect={onRename}>
                <BookStack width={18} height={18} /> Rename collection
              </DropdownMenu.Item>
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger>
                  <EditPencil width={18} height={18} /> Change color
                </DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent>
                  <DropdownMenu.Item onSelect={() => setBgColor(null)}>
                    <span className={styles.colorDotOutline} /> No color
                  </DropdownMenu.Item>
                  {COLORS.map((color) => (
                    <DropdownMenu.Item
                      key={color}
                      onSelect={() => setBgColor(color)}
                    >
                      <span className={styles.colorDot} data-color={color} />{" "}
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.SubContent>
              </DropdownMenu.Sub>
              <DropdownMenu.Item isDelete onSelect={onDelete}>
                <Trash width={18} height={18} /> Delete collection
              </DropdownMenu.Item>
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
