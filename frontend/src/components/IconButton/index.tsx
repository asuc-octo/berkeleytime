import { ComponentPropsWithoutRef, ReactNode, forwardRef } from "react";

import classNames from "classnames";

import styles from "./IconButton.module.scss";

interface IconButtonProps {
  children: ReactNode;
  className?: string;
  invert?: boolean;
  active?: boolean;
}

const IconButton = forwardRef<
  HTMLButtonElement,
  IconButtonProps & ComponentPropsWithoutRef<"button">
>(({ active, children, className, invert, ...props }, forwardedRef) => {
  return (
    <button
      className={classNames(
        styles.root,
        {
          [styles.active]: active,
          [styles.invert]: invert,
        },
        className
      )}
      ref={forwardedRef}
      {...props}
    >
      {children}
    </button>
  );
});

IconButton.displayName = "IconButton";

export default IconButton;
