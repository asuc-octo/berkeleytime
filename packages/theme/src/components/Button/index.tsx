import { ComponentPropsWithRef, ElementType } from "react";

import classNames from "classnames";

import styles from "./Button.module.scss";

interface Props<T> {
  active?: boolean;
  disabled?: boolean;
  variant?: "outline" | "solid";
  as?: T;
}

export type ButtonProps<T extends ElementType> = Props<T> &
  Omit<ComponentPropsWithRef<T>, keyof Props<T>>;

export function Button<T extends ElementType>({
  className,
  disabled,
  variant = "outline",
  as,
  ...props
}: ButtonProps<T>) {
  const Component = as || "button";

  return (
    <Component
      {...props}
      data-variant={variant}
      disabled={disabled ? true : undefined}
      data-disabled={disabled ? true : undefined}
      className={classNames(styles.root, className)}
    />
  );
}
