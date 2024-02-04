import { ComponentPropsWithRef, ElementType, ReactNode } from "react";

import classNames from "classnames";

import styles from "./IconButton.module.scss";

interface IconButtonProps<T = ElementType> {
  children: ReactNode;
  className?: string;
  invert?: boolean;
  as?: T;
}

export default function IconButton<T extends ElementType = "button">({
  active,
  children,
  className,
  invert,
  as,
  ...props
}: IconButtonProps<T> &
  Omit<ComponentPropsWithRef<T>, keyof IconButtonProps<T>>) {
  const Component = as ?? "button";

  return (
    <Component
      className={classNames(
        styles.root,
        {
          [styles.active]: active,
          [styles.invert]: invert,
        },
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
