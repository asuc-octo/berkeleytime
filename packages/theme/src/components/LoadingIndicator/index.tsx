import { ComponentPropsWithRef, ReactNode } from "react";

import classNames from "classnames";

import styles from "./LoadingIndicator.module.scss";

export type LoadingIndicatorProps = {
  size?: "md" | "lg";
} & (
  | {
      loading: boolean;
      children: ReactNode;
    }
  | {
      loading?: never;
      children?: never;
    }
);

export function LoadingIndicator({
  size = "md",
  children,
  loading,
  className,
  ...props
}: LoadingIndicatorProps &
  Omit<ComponentPropsWithRef<"div">, keyof LoadingIndicatorProps>) {
  return !children || (children && loading) ? (
    <div
      {...props}
      className={classNames(styles.root, className)}
      data-size={size}
    />
  ) : (
    children
  );
}
