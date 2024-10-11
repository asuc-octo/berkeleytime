import { ComponentPropsWithoutRef, forwardRef } from "react";

import classNames from "classnames";

import styles from "./Container.module.scss";

export interface ContainerProps extends ComponentPropsWithoutRef<"div"> {
  size?: "sm" | "md" | "lg";
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, className, size = "md", ...props }, ref) => {
    return (
      <div
        {...props}
        ref={ref}
        data-size={size}
        className={classNames(styles.root, className)}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";
