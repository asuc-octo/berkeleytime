import { ComponentPropsWithoutRef, ReactNode, forwardRef } from "react";

import classNames from "classnames";

import styles from "./Button.module.scss";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  secondary?: boolean;
  active?: boolean;
}

const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps & Omit<ComponentPropsWithoutRef<"button">, keyof ButtonProps>
>(({ active, children, className, secondary, ...props }, forwardedRef) => {
  return (
    <button
      ref={forwardedRef}
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
    </button>
  );
});

Button.displayName = "Button";

export default Button;
