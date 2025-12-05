import { ReactNode } from "react";

import { MoreHoriz, NavArrowRight } from "iconoir-react";

import { DropdownMenu, IconButton } from "@repo/theme";

import styles from "./BubbleCard.module.scss";

export interface MenuItem {
  name: string;
  icon: ReactNode;
  onClick?: () => void;
  isDelete?: boolean;
  subItems?: MenuItem[];
}

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

  const renderMenuItem = (item: MenuItem, index: number) => {
    if (item.subItems && item.subItems.length > 0) {
      return (
        <DropdownMenu.Sub key={index}>
          <DropdownMenu.SubTrigger>
            {item.icon} {item.name}
            <NavArrowRight
              width={14}
              height={14}
              style={{ marginLeft: "auto" }}
            />
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent sideOffset={-2}>
            {item.subItems.map((subItem, subIndex) => (
              <DropdownMenu.Item
                key={subIndex}
                onSelect={subItem.onClick}
                isDelete={subItem.isDelete}
              >
                {subItem.icon} {subItem.name}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
      );
    }

    return (
      <DropdownMenu.Item
        key={index}
        onSelect={item.onClick}
        isDelete={item.isDelete}
      >
        {item.icon} {item.name}
      </DropdownMenu.Item>
    );
  };

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
        {menuItems.length > 0 && (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu.Root modal={false}>
              <DropdownMenu.Trigger asChild>
                <IconButton className={styles.menuButton}>
                  <MoreHoriz />
                </IconButton>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content sideOffset={5} align="start">
                {menuItems.map((item, index) => renderMenuItem(item, index))}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        )}
      </div>
    </div>
  );
}

// Export spring transition for use in children components
export { springTransition };
