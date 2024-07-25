import { ElementType, ReactNode, forwardRef } from "react";

import classNames from "classnames";

import {
  PolymorphicComponentPropsWithRef,
  PolymorphicRef,
} from "@/lib/polymorphism";

import styles from "./Button.module.scss";

interface Props {
  variant?: "solid" | "outline";
}

type ButtonProps<C extends ElementType> = PolymorphicComponentPropsWithRef<
  C,
  Props
>;

const Button = forwardRef(
  <C extends ElementType = "button">(
    {
      active,
      children,
      className,
      variant = "solid",
      ...props
    }: ButtonProps<C>,
    ref: PolymorphicRef<C>
  ) => {
    return (
      <button
        ref={ref}
        className={classNames(
          styles.root,
          {
            [styles.solid]: variant === "solid",
            [styles.outline]: variant === "outline",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button as <T extends ElementType = "button">(
  props: ButtonProps<T>
) => ReactNode | null;
