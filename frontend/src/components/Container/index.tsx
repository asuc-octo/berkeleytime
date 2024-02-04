import { ReactNode } from "react";

import styles from "./Container.module.scss";

interface ContainerProps {
  children?: ReactNode;
}

export default function Container({ children }: ContainerProps) {
  return <div className={styles.root}>{children}</div>;
}
