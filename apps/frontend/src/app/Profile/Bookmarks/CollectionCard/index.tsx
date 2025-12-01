import { useState } from "react";

import {
  BookStack,
  EditPencil,
  MoreHoriz,
  Pin,
  PinSlash,
  PinSolid,
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

const COLORS = {
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#a855f7",
} as const;

export function CollectionCard({
  name,
  classCount,
  isPinned = false,
  onPin,
  onDelete,
}: CollectionCardProps) {
  const [bgColor, setBgColor] = useState<string | null>(null);

  const handlePinToggle = () => {
    onPin?.(!isPinned);
  };

  return (
    <div className={styles.root}>
      {bgColor && (
        <div
          className={styles.colorBackground}
          style={{ backgroundColor: bgColor }}
        />
      )}
      <div className={styles.cardsStack}>
        <div className={styles.stackedCard}>
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
        </div>
        <div className={styles.stackedCard}>
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
        </div>
      </div>
      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.collectionName}>
            {isPinned && <PinSolid width={14} height={14} />}
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
                <DropdownMenu.Item onSelect={() => setBgColor(COLORS.red)}>
                  <span
                    className={styles.colorDot}
                    style={{ backgroundColor: COLORS.red }}
                  />{" "}
                  Red
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => setBgColor(COLORS.orange)}>
                  <span
                    className={styles.colorDot}
                    style={{ backgroundColor: COLORS.orange }}
                  />{" "}
                  Orange
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => setBgColor(COLORS.yellow)}>
                  <span
                    className={styles.colorDot}
                    style={{ backgroundColor: COLORS.yellow }}
                  />{" "}
                  Yellow
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => setBgColor(COLORS.green)}>
                  <span
                    className={styles.colorDot}
                    style={{ backgroundColor: COLORS.green }}
                  />{" "}
                  Green
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => setBgColor(COLORS.blue)}>
                  <span
                    className={styles.colorDot}
                    style={{ backgroundColor: COLORS.blue }}
                  />{" "}
                  Blue
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => setBgColor(COLORS.purple)}>
                  <span
                    className={styles.colorDot}
                    style={{ backgroundColor: COLORS.purple }}
                  />{" "}
                  Purple
                </DropdownMenu.Item>
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
