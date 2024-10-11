import { ElementType, ReactNode, forwardRef } from "react";

import classNames from "classnames";

import {
  PolymorphicComponentPropsWithRef,
  PolymorphicRef,
} from "../../lib/polymorphism";
import styles from "./Button.module.scss";

interface Props {
  variant?: "solid" | "outline";
  disabled?: boolean;
}

export type ButtonProps<C extends ElementType> =
  PolymorphicComponentPropsWithRef<C, Props>;

const PolymorphicComponent = forwardRef(
  <C extends ElementType = "button">(
    {
      children,
      className,
      disabled,
      variant = "outline",
      ...props
    }: ButtonProps<C>,
    ref: PolymorphicRef<C>
  ) => {
    return (
      <button
        {...props}
        ref={ref}
        data-variant={variant}
        disabled={disabled}
        data-disabled={disabled}
        className={classNames(styles.root, className)}
      >
        {children}
      </button>
    );
  }
);

PolymorphicComponent.displayName = "Button";

export const Button = PolymorphicComponent as <
  T extends ElementType = "button",
>(
  props: ButtonProps<T>
) => ReactNode | null;
