import React, { ComponentPropsWithRef } from "react";

import { Flex } from "@radix-ui/themes";

import { Color } from "../ThemeProvider";
import styles from "./Badge.module.scss";

interface Props {
  label: string;
  color: Color;
  variant?: "filled" | "border";
  icon?: React.ReactNode;
}

export type BadgeProps = Props &
  Omit<ComponentPropsWithRef<"span">, keyof Props>;

export function Badge({
  label,
  color,
  icon,
  style,
  variant = "filled",
  ...props
}: BadgeProps) {
  return (
    <span
      className={styles.root}
      style={{
        color:
          variant === "filled"
            ? `var(--${color}-500)`
            : `var(--${color}-badge)`,
        backgroundColor: `var(--${color}-500-20)`,
        border: variant === "filled" ? "none" : undefined,
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
