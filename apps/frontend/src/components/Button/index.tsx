import { ElementType, ReactNode, forwardRef } from "react";

import classNames from "classnames";

import {
  PolymorphicComponentPropsWithRef,
  PolymorphicRef,
} from "@/lib/polymorphism";

import styles from "./Button.module.scss";

interface Props {
  variant?: "solid" | "outline";
  disabled?: boolean;
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
      disabled,
      variant = "solid",
      ...props
    }: ButtonProps<C>,
    ref: PolymorphicRef<C>
  ) => {
    return (
      <button
        ref={ref}
        data-variant={variant}
        data-disabled={disabled}
        className={classNames(styles.root, className)}
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
