import { ReactNode } from "react";

import { NavArrowRight, MoreHoriz } from "iconoir-react";

import { Card, DropdownMenu, IconButton } from "@repo/theme";

import styles from "./ActionMenu.module.scss";

export interface MenuItem {
  name: string;
  icon: ReactNode;
  onClick?: () => void;
  isDelete?: boolean;
  subItems?: MenuItem[];
}

export interface ActionMenuProps {
  menuItems: MenuItem[];
  buttonClassName?: string;
  asIcon?: boolean;
}

export function ActionMenu({ menuItems, buttonClassName, asIcon = false }: ActionMenuProps) {
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

  if (menuItems.length === 0) {
    return null;
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger asChild>
          {asIcon ? (
            <Card.ActionIcon
              data-action-icon
              className={buttonClassName}
              style={{ color: "var(--paragraph-color)" }}
            >
              <MoreHoriz />
            </Card.ActionIcon>
          ) : (
            <IconButton className={buttonClassName || styles.menuButton}>
              <MoreHoriz />
            </IconButton>
          )}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content sideOffset={5} align="start">
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
}

