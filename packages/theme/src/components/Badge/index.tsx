import React, { ComponentPropsWithRef } from "react";

import { Flex } from "@radix-ui/themes";

import { Color } from "../ThemeProvider";
import styles from "./Badge.module.scss";

interface Props {
  label: string;
  color: Color;
  icon?: React.ReactNode;
}

export type BadgeProps = Props &
  Omit<ComponentPropsWithRef<"span">, keyof Props>;

export function Badge({ label, color, icon, style, ...props }: BadgeProps) {
  return (
    <span
      className={styles.root}
      style={{
        color: `var(--${color}-badge)`,
        backgroundColor: `var(--${color}-500-20)`,
        ...style,
      }}
      {...props}
    >
      <Flex direction="row" gap="4px">
        {label}
        {icon && icon}
      </Flex>
    </span>
  );
}
export function BadgeLabel({
  label,
  color,
  icon,
  style,
  ...props
}: BadgeProps) {
  return (
    <span
      className={styles.root}
      style={{
        color: `var(--${color}-500)`,
        backgroundColor: `var(--${color}-500-20)`,
        border: "none",
        ...style,
      }}
      {...props}
    >
      <Flex direction="row" gap="4px">
        {label}
        {icon && icon}
      </Flex>
    </span>
  );
}
