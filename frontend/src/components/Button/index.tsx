import { ComponentPropsWithRef, ElementType, ReactNode } from "react";

import classNames from "classnames";

import styles from "./Button.module.scss";

interface ButtonProps<T = ElementType> {
  children: ReactNode;
  className?: string;
  as?: T;
  secondary?: boolean;
}

export default function Button<T extends ElementType = "button">({
  active,
  children,
  className,
  secondary,
  as,
  ...props
}: ButtonProps<T> & Omit<ComponentPropsWithRef<T>, keyof ButtonProps<T>>) {
  const Component = as ?? "button";

  return (
    <Component
      className={classNames(
        styles.root,
        {
          [styles.active]: active,
          [styles.secondary]: secondary,
        },
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
