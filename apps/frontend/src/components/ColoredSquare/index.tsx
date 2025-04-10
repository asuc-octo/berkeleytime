import styles from "./ColoredSquare.module.scss";

interface ColoredSquareProps {
  color: string;
  size?: "sm" | "md";
}

export function ColoredSquare({ color, size = "md" }: ColoredSquareProps) {
  return (
    <span
      style={{
        backgroundColor: color,
      }}
      data-size={size}
      className={styles.root}
    />
  );
}
