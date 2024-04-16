import classNames from "classnames";

import styles from "./Filters.module.scss";

interface FiltersProps {
  responsive: boolean;
  block?: boolean;
}

export default function Filters({ responsive, block }: FiltersProps) {
  return (
    <div
      className={classNames(styles.root, {
        [styles.responsive]: responsive,
        [styles.block]: block,
      })}
    />
  );
}
