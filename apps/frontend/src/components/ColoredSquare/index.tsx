import styles from "./ColoredSquare.module.scss";

export function ColoredSquare({
  color,
  size,
}: {
  color: string;
  size?: number;
}) {
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
