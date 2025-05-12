import { ComponentPropsWithRef } from "react";

import { Flex } from "@radix-ui/themes";

import styles from "./Badge.module.scss";

interface Props {
  label: string;
  color: string;
  icon?: React.ReactNode;
}

export type BadgeProps = Props &
  Omit<ComponentPropsWithRef<"span">, keyof Props>;

export function Badge({ label, color, icon, ...props }: BadgeProps) {
  return (
    <span
      className={styles.root}
      style={{
        color: `var(--${color}-badge)`,
        backgroundColor: `var(--${color}-500-20)`,
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
