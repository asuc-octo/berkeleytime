import { forwardRef } from "react";

import classNames from "classnames";

import type * as Polymorphic from "../../lib/polymorphism";
import styles from "./IconButton.module.scss";

interface Props {
  variant?: "outline";
  disabled?: boolean;
}

type PolymorphicIconButton = Polymorphic.ForwardRefComponent<"button", Props>;

export const IconButton = forwardRef(
  (
    {
      children,
      className,
      disabled,
      as: Component = "button",
      variant = "outline",
      ...props
    },
    ref
  ) => {
    return (
      <Component
        disabled={disabled || undefined}
        data-disabled={disabled || undefined}
        data-variant={variant}
        className={classNames(styles.root, className)}
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    );
  }
) as PolymorphicIconButton;

IconButton.displayName = "IconButton";
