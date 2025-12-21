import { ReactNode } from "react";

import { ActionMenu, MenuItem } from "@/components/ActionMenu";

import styles from "./BubbleCard.module.scss";

// Re-export MenuItem for backward compatibility
export type { MenuItem };

export interface BubbleCardProps {
  title: string | ReactNode;
  description?: string | ReactNode;
  cssColor?: string | null;
  menuItems?: MenuItem[];
  children?: ReactNode;
  onClick?: () => void;
  showCards?: boolean;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  width?: number | string;
  height?: number | string;
  childrenBackgroundColor?: string;
  childrenPadding?: boolean;
}

const springTransition = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30,
};

export function BubbleCard({
  title,
  description,
  cssColor,
  menuItems = [],
  children,
  onClick,
  showCards = true,
  isHovered: _isHovered,
  onMouseEnter: externalOnMouseEnter,
  onMouseLeave: externalOnMouseLeave,
  width,
  height,
  childrenBackgroundColor,
  childrenPadding = false,
}: BubbleCardProps) {
  const handleMouseEnter = () => {
    externalOnMouseEnter?.();
  };

  const handleMouseLeave = () => {
    externalOnMouseLeave?.();
  };

  const rootStyle: React.CSSProperties = {};
  if (width !== undefined) {
    rootStyle.width = typeof width === "number" ? `${width}px` : width;
  }
  if (height !== undefined) {
    rootStyle.height = typeof height === "number" ? `${height}px` : height;
  }

  const bubbleStyle: React.CSSProperties = {
    opacity: showCards ? 1 : 0,
  };
  if (childrenBackgroundColor) {
    bubbleStyle.backgroundColor = childrenBackgroundColor;
  }

  return (
    <div
      className={styles.root}
      style={rootStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {cssColor && (
        <div
          className={styles.colorBackground}
          style={{ backgroundColor: cssColor }}
        />
      )}
      <div
        className={`${styles.bubble} ${childrenPadding ? styles.bubbleWithPadding : ""}`}
        style={bubbleStyle}
      >
        {children}
      </div>
      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.title}>{title}</p>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        <ActionMenu menuItems={menuItems} buttonClassName={styles.menuButton} />
      </div>
    </div>
  );
}

// Export spring transition for use in children components
export { springTransition };
