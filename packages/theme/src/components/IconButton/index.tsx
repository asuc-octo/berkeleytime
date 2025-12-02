import { ComponentPropsWithRef, ElementType } from "react";

import classNames from "classnames";

import styles from "./IconButton.module.scss";

interface Props<T> {
  active?: boolean;
  disabled?: boolean;
  variant?: "outline" | "solid";
  as?: T;
}

export type IconButtonProps<T extends ElementType> = Props<T> &
  Omit<ComponentPropsWithRef<T>, keyof Props<T>>;

export function IconButton<T extends ElementType>({
  className,
  disabled,
  as,
  variant = "outline",
  ...props
}: IconButtonProps<T>) {
  const Component = as || "button";

  return (
    <Component
      data-disabled={disabled || undefined}
      disabled={disabled || undefined}
      data-variant={variant}
      className={classNames(styles.root, className)}
      {...props}
    />
  );
}
