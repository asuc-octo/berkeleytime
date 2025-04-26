import { ComponentPropsWithRef } from "react";

import styles from "./Badge.module.scss";

interface Props {
  label: string;
  color: string;
}

export type BadgeProps = Props &
  Omit<ComponentPropsWithRef<'span'>, keyof Props>;

export function Badge({
  label,
  color,
  ...props
}: BadgeProps) {
  return <span className={styles.root} style={{color: `var(--${color}-badge)`, backgroundColor: `var(--${color}-500-20)`}} {...props}>
    { label }
  </span>
}
