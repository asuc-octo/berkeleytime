import { ComponentPropsWithRef, ElementType } from "react";

import classNames from "classnames";

import styles from "./MenuItem.module.scss";

interface Props<T> {
  active?: boolean;
  disabled?: boolean;
  as?: T;
}

export type MenuItemProps<T extends ElementType> = Props<T> &
  Omit<ComponentPropsWithRef<T>, keyof Props<T>>;

export function MenuItem<T extends ElementType>({
  active,
  children,
  className,
  disabled,
  as,
  ...props
}: MenuItemProps<T>) {
  const Component = as || "button";

  return (
    <Component
      data-disabled={disabled || undefined}
      disabled={disabled || undefined}
      className={classNames(
        styles.root,
        {
          active,
        },
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
