import styles from "./ColorSquare.module.scss";

export function ColorSquare({ color, size }: { color: string; size?: number }) {
  return (
    <span
      style={{
        backgroundColor: color,
        width: size ? size : 12,
        height: size ? size : 12,
      }}
      className={styles.root}
    />
  );
}
