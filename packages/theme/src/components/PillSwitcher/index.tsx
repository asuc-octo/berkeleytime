import classNames from "classnames";
import { Tabs } from "radix-ui";

import styles from "./PillSwitcher.module.scss";

export interface PillSwitcherItem {
  value: string;
  label: string;
}

export interface PillSwitcherProps {
  items: PillSwitcherItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  fullWidth?: boolean;
}

export function PillSwitcher({
  items,
  defaultValue,
  value,
  onValueChange,
  fullWidth = false,
}: PillSwitcherProps) {
  return (
    <Tabs.Root
      defaultValue={defaultValue || items[0]?.value}
      value={value}
      onValueChange={onValueChange}
    >
      <Tabs.List
        className={classNames(styles.list, {
          [styles.fullWidthList]: fullWidth,
        })}
      >
        {items.map((item) => (
          <Tabs.Trigger
            key={item.value}
            value={item.value}
            className={classNames(styles.trigger, {
              [styles.fullWidthTrigger]: fullWidth,
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
