import { ReactNode } from "react";

import styles from "./Boundary.module.scss";

interface BoundaryProps {
  children: ReactNode;
}

export default function Boundary({ children }: BoundaryProps) {
  return <div className={styles.root}>{children}</div>;
}
