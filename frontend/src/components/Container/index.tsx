import { ComponentPropsWithoutRef, forwardRef } from "react";

import classNames from "classnames";

import styles from "./Container.module.scss";

interface ContainerProps extends ComponentPropsWithoutRef<"div"> {
  size?: "small" | "medium" | "large";
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, className, size = "large", ...props }, ref) => {
    return (
      <div
        {...props}
        ref={ref}
        className={classNames(styles.root, className, {
          [styles.small]: size === "small",
          [styles.medium]: size === "medium",
          [styles.large]: size === "large",
        })}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";

export default Container;
