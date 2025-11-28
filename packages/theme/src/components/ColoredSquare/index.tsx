import { ComponentPropsWithRef } from "react";

import styles from "./ColoredSquare.module.scss";

interface ColoredSquareProps {
  color: string;
  size?: "sm" | "md" | "lg";
  variant?: "square" | "circle" | "dot" | "line";
}

export function ColoredSquare({
  color,
  size = "md",
  variant = "square",
  ...props
}: ColoredSquareProps &
  Omit<ComponentPropsWithRef<"div">, keyof ColoredSquareProps>) {
  return (
    <span
      style={{
        backgroundColor: color,
        ...props.style,
      }}
      data-size={size}
      data-variant={variant}
      className={styles.root}
    />
  );
}
