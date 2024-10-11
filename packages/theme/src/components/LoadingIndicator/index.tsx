import { ComponentPropsWithoutRef, ReactNode, forwardRef } from "react";

import classNames from "classnames";

import styles from "./LoadingIndicator.module.scss";

type Props = {
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

export type LoadingIndicatorProps = Props &
  Omit<ComponentPropsWithoutRef<"div">, keyof Props>;

export const LoadingIndicator = forwardRef<
  HTMLDivElement,
  LoadingIndicatorProps
>(({ size = "md", children, loading, className, ...props }, ref) => {
  return !children || (children && loading) ? (
    <div
      {...props}
      className={classNames(styles.root, className)}
      data-size={size}
      ref={ref}
    />
  ) : (
    children
  );
});

LoadingIndicator.displayName = "LoadingIndicator";
