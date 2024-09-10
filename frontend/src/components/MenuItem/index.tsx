import { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import classNames from "classnames";

import styles from "./MenuItem.module.scss";

interface MenuItemProps<T = ElementType> {
  active?: boolean;
  children: ReactNode;
  className?: string;
  as?: T;
}

export default function MenuItem({
  active,
  children,
  className,
  ...props
}: MenuItemProps & ComponentPropsWithoutRef<"button">) {
  return (
    <button
      {...props}
      className={classNames(
        styles.root,
        {
          active,
        },
        className
      )}
    >
      {children}
    </button>
  );
}
