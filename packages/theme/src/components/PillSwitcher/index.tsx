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
}

export function PillSwitcher({
  items,
  defaultValue,
  value,
  onValueChange,
}: PillSwitcherProps) {
  return (
    <Tabs.Root
      defaultValue={defaultValue || items[0]?.value}
      value={value}
      onValueChange={onValueChange}
    >
      <Tabs.List className={styles.list}>
        {items.map((item) => (
          <Tabs.Trigger key={item.value} value={item.value} className={styles.trigger}>
            {item.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}

export default PillSwitcher;
