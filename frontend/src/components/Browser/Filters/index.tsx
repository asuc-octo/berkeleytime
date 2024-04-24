import * as Checkbox from "@radix-ui/react-checkbox";
import classNames from "classnames";
import { Check } from "iconoir-react";

import styles from "./Filters.module.scss";

interface FiltersProps {
  overlay: boolean;
  block: boolean;
}

export default function Filters({ overlay, block }: FiltersProps) {
  return (
    <div
      className={classNames(styles.root, {
        [styles.overlay]: overlay,
        [styles.block]: block,
      })}
    >
      <p className={styles.label}>Units</p>
      <div className={styles.row}>
        <Checkbox.Root className={styles.checkbox} defaultChecked id="c1">
          <Checkbox.Indicator asChild>
            <Check width={12} height={12} />
          </Checkbox.Indicator>
        </Checkbox.Root>
        <label className={styles.description} htmlFor="c1">
          4 units
        </label>
      </div>
      <div className={styles.row}>
        <Checkbox.Root className={styles.checkbox} defaultChecked id="c1">
          <Checkbox.Indicator asChild>
            <Check width={12} height={12} />
          </Checkbox.Indicator>
        </Checkbox.Root>
        <label className={styles.description} htmlFor="c1">
          3 units
        </label>
      </div>
      <div className={styles.row}>
        <Checkbox.Root className={styles.checkbox} defaultChecked id="c1">
          <Checkbox.Indicator asChild>
            <Check width={12} height={12} />
          </Checkbox.Indicator>
        </Checkbox.Root>
        <label className={styles.description} htmlFor="c1">
          2 units
        </label>
      </div>
      <div className={styles.row}>
        <Checkbox.Root className={styles.checkbox} defaultChecked id="c1">
          <Checkbox.Indicator asChild>
            <Check width={12} height={12} />
          </Checkbox.Indicator>
        </Checkbox.Root>
        <label className={styles.description} htmlFor="c1">
          1 unit
        </label>
      </div>
      <p className={styles.label}>Level</p>
      <div className={styles.row}>
        <Checkbox.Root className={styles.checkbox} defaultChecked id="c1">
          <Checkbox.Indicator asChild>
            <Check width={12} height={12} />
          </Checkbox.Indicator>
        </Checkbox.Root>
        <label className={styles.description} htmlFor="c1">
          Lower division
        </label>
      </div>
      <div className={styles.row}>
        <Checkbox.Root className={styles.checkbox} defaultChecked id="c1">
          <Checkbox.Indicator asChild>
            <Check width={12} height={12} />
          </Checkbox.Indicator>
        </Checkbox.Root>
        <label className={styles.description} htmlFor="c1">
          Upper division
        </label>
      </div>
      <div className={styles.row}>
        <Checkbox.Root className={styles.checkbox} defaultChecked id="c1">
          <Checkbox.Indicator asChild>
            <Check width={12} height={12} />
          </Checkbox.Indicator>
        </Checkbox.Root>
        <label className={styles.description} htmlFor="c1">
          Graduate
        </label>
      </div>
    </div>
  );
}
