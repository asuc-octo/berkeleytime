import { ComponentPropsWithRef, ElementType } from "react";

import classNames from "classnames";

import styles from "./Button.module.scss";

interface Props<T> {
  active?: boolean;
  disabled?: boolean;
  isDelete?: boolean;
  variant?: "primary" | "secondary" | "tertiary";
  noFill?: boolean;
  as?: T;
}

export type ButtonProps<T extends ElementType> = Props<T> &
  Omit<ComponentPropsWithRef<T>, keyof Props<T>>;

export function Button<T extends ElementType>({
  className,
  disabled,
  isDelete,
  variant = "primary",
  noFill,
  as,
  ...props
}: ButtonProps<T>) {
  const Component = as || "button";

  return (
    <Component
      {...props}
      data-variant={variant}
      data-nofill={noFill || undefined}
      data-delete={isDelete}
      disabled={disabled || undefined}
      data-disabled={disabled || undefined}
      className={classNames(styles.root, className)}
    />
  );
}
