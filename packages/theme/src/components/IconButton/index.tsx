import { ElementType, ReactNode, forwardRef } from "react";

import classNames from "classnames";

import {
  PolymorphicComponentPropsWithRef,
  PolymorphicRef,
} from "../../lib/polymorphism";
import styles from "./IconButton.module.scss";

interface Props {
  variant?: "outline";
  disabled?: boolean;
}

export type IconButtonProps<C extends ElementType> =
  PolymorphicComponentPropsWithRef<C, Props>;

const PolymorphicComponent = forwardRef(
  <C extends ElementType = "button">(
    {
      children,
      className,
      disabled,
      as,
      variant = "outline",
      ...props
    }: IconButtonProps<C>,
    ref: PolymorphicRef<C>
  ) => {
    const Component = as || "button";

    return (
      <Component
        data-disabled={disabled}
        disabled={disabled}
        data-variant={variant}
        className={classNames(styles.root, className)}
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

PolymorphicComponent.displayName = "IconButton";

export const IconButton = PolymorphicComponent as <
  T extends ElementType = "button",
>(
  props: IconButtonProps<T>
) => ReactNode | null;
