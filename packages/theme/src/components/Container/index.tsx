import { ComponentPropsWithRef } from "react";

import classNames from "classnames";

import styles from "./Container.module.scss";

export interface ContainerProps {
  size?: "sm" | "md" | "lg";
}

export function Container({
  className,
  size = "md",
  ...props
}: Omit<ComponentPropsWithRef<"div">, keyof ContainerProps> & ContainerProps) {
  return (
    <div
      {...props}
      data-size={size}
      className={classNames(styles.root, className)}
    />
  );
}
