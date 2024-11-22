import { forwardRef } from "react";

import classNames from "classnames";

import type * as Polymorphic from "../../lib/polymorphism";
import styles from "./Button.module.scss";

interface Props {
  variant?: "solid" | "outline";
  disabled?: boolean;
}

type PolymorphicButton = Polymorphic.ForwardRefComponent<"button", Props>;

export const Button = forwardRef(
  (
    {
      children,
      className,
      disabled,
      variant = "outline",
      as: Component = "button",
      ...props
    },
    ref
  ) => {
    return (
      <Component
        {...props}
        ref={ref}
        data-variant={variant}
        disabled={disabled}
        data-disabled={disabled}
        className={classNames(styles.root, className)}
      >
        {children}
      </Component>
    );
  }
) as PolymorphicButton;

Button.displayName = "Button";
