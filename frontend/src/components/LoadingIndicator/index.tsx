import styles from "./LoadingIndicator.module.scss";

interface LoadingIndicatorProps {
  size?: number;
}

export default function LoadingIndicator({ size = 32 }: LoadingIndicatorProps) {
  return <div className={styles.root} style={{ width: `${size}px` }} />;
}
