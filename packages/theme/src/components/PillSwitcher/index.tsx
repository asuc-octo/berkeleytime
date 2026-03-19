import { ReactNode } from "react";

import classNames from "classnames";
import { Tabs } from "radix-ui";

import styles from "./PillSwitcher.module.scss";

export interface PillSwitcherItem {
  value: string;
  label: ReactNode;
}

export interface PillSwitcherProps {
  items: PillSwitcherItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  fullWidth?: boolean;
  iconOnly?: boolean;
  variant?: "default" | "tabs";
}

export function PillSwitcher({
  items,
  defaultValue,
  value,
  onValueChange,
  fullWidth = false,
  iconOnly = false,
  variant = "default",
}: PillSwitcherProps) {
  const isTabs = variant === "tabs";

  return (
    <Tabs.Root
      defaultValue={defaultValue || items[0]?.value}
      value={value}
      onValueChange={onValueChange}
    >
      <Tabs.List
        className={classNames(styles.list, {
          [styles.tabsList]: isTabs,
          [styles.fullWidthList]: fullWidth && !isTabs,
          [styles.iconOnlyList]: iconOnly,
        })}
      >
        {items.map((item) => (
          <Tabs.Trigger
            key={item.value}
            value={item.value}
            className={classNames(styles.trigger, {
              [styles.tabsTrigger]: isTabs,
              [styles.fullWidthTrigger]: fullWidth && !isTabs,
              [styles.iconOnlyTrigger]: iconOnly,
            })}
          >
            {item.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}

export default PillSwitcher;
