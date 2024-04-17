import classNames from "classnames";

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
    />
  );
}
