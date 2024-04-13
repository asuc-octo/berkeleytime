import {
  ComponentPropsWithRef,
  ElementType,
  ReactNode,
  forwardRef,
} from "react";

import classNames from "classnames";

import styles from "./Button.module.scss";

interface ButtonProps<T = ElementType> {
  children: ReactNode;
  className?: string;
  as?: T;
  secondary?: boolean;
}

const Button = forwardRef(
  <T extends ElementType = "button">(
    {
      active,
      children,
      className,
      secondary,
      as,
      ...props
    }: ButtonProps<T> & Omit<ComponentPropsWithRef<T>, keyof ButtonProps<T>>,
    ref: ComponentPropsWithRef<T>["ref"]
  ) => {
    const Component = as ?? "button";

    return (
      <Component
        ref={ref}
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
);

Button.displayName = "Button";

export default Button;
