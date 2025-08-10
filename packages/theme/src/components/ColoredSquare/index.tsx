import { ComponentPropsWithRef } from "react";

import styles from "./ColoredSquare.module.scss";

interface ColoredSquareProps {
  color: string;
  size?: "sm" | "md";
}

export function ColoredSquare({
  color,
  size = "md",
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
      className={styles.root}
    />
  );
}
