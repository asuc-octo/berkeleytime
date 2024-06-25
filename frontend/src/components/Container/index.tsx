import { ReactNode } from "react";

import classNames from "classnames";

import styles from "./Container.module.scss";

interface ContainerProps {
  children?: ReactNode;
  className?: string;
}

export default function Container({ children, className }: ContainerProps) {
  return <div className={classNames(styles.root, className)}>{children}</div>;
}
