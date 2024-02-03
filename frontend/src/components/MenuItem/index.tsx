import { ReactNode } from "react";

import classNames from "classnames";

import styles from "./MenuItem.module.scss";

interface MenuItemProps {
  active?: boolean;
  children: ReactNode;
  className?: string;
}

export default function MenuItem({
  active,
  children,
  className,
}: MenuItemProps) {
  return (
    <div
      className={classNames(
        styles.root,
        {
          [styles.active]: active,
        },
        className
      )}
    >
      {children}
    </div>
  );
}
