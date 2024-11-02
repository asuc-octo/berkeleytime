import { ComponentPropsWithoutRef, forwardRef } from "react";

import classNames from "classnames";

import styles from "./Boundary.module.scss";

export type BoundaryProps = ComponentPropsWithoutRef<"div">;

export const Boundary = forwardRef<HTMLDivElement, BoundaryProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div {...props} className={classNames(styles.root, className)} ref={ref}>
        {children}
      </div>
    );
  }
);

Boundary.displayName = "Boundary";
