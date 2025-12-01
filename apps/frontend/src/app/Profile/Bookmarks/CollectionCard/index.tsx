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
  onDelete?: () => void;
}

const COLORS: Record<string, { light: string; dark: string }> = {
  red: { light: "var(--red-300)", dark: "var(--red-700)" },
  orange: { light: "var(--orange-300)", dark: "var(--orange-700)" },
  amber: { light: "var(--amber-300)", dark: "var(--amber-700)" },
  yellow: { light: "var(--yellow-300)", dark: "var(--yellow-700)" },
  lime: { light: "var(--lime-300)", dark: "var(--lime-700)" },
  green: { light: "var(--green-300)", dark: "var(--green-700)" },
  emerald: { light: "var(--emerald-300)", dark: "var(--emerald-700)" },
  teal: { light: "var(--teal-300)", dark: "var(--teal-700)" },
  cyan: { light: "var(--cyan-300)", dark: "var(--cyan-700)" },
  sky: { light: "var(--sky-300)", dark: "var(--sky-700)" },
  blue: { light: "var(--blue-300)", dark: "var(--blue-700)" },
  indigo: { light: "var(--indigo-300)", dark: "var(--indigo-700)" },
  violet: { light: "var(--violet-300)", dark: "var(--violet-700)" },
  purple: { light: "var(--purple-300)", dark: "var(--purple-700)" },
  fuchsia: { light: "var(--fuchsia-300)", dark: "var(--fuchsia-700)" },
  pink: { light: "var(--pink-300)", dark: "var(--pink-700)" },
  rose: { light: "var(--rose-300)", dark: "var(--rose-700)" },
};

const springTransition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
};

export function CollectionCard({
  name,
  classCount,
  isPinned = false,
  onPin,
  onDelete,
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
    >
      {bgColor && (
        <div
          className={styles.colorBackground}
          data-color={bgColor}
        />
      )}
      <div className={styles.cardsStack}>
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
            {isPinned && <PinSolid width={14} height={14} color="var(--blue-500)" />}
            {name}
          </p>
          <p className={styles.classCount}>{classCount} classes</p>
        </div>
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
            <DropdownMenu.Item>
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
                {Object.entries(COLORS).map(([key, value]) => (
                  <DropdownMenu.Item key={key} onSelect={() => setBgColor(key)}>
                    <span
                      className={styles.colorDot}
                      style={{ backgroundColor: value.light }}
                    />{" "}
                    {key.charAt(0).toUpperCase() + key.slice(1)}
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
