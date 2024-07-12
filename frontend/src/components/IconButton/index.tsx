import { ElementType, ReactElement, forwardRef } from "react";

import classNames from "classnames";

import {
  PolymorphicComponentPropsWithRef,
  PolymorphicRef,
} from "@/lib/polymorphism";

import styles from "./IconButton.module.scss";

interface Props {
  variant?: "outline";
  invert?: boolean;
}

type IconButtonProps<C extends ElementType> = PolymorphicComponentPropsWithRef<
  C,
  Props
>;

const IconButton = forwardRef(
  <C extends ElementType = "button">(
    {
      children,
      className,
      invert,
      as,
      variant = "outline",
      ...props
    }: IconButtonProps<C>,
    ref: PolymorphicRef<C>
  ) => {
    const Component = as || "button";

    return (
      <Component
        className={classNames(
          styles.root,
          {
            [styles.invert]: invert,
            [styles.outline]: variant === "outline",
          },
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton as <T extends ElementType = "button">(
  props: IconButtonProps<T>
) => ReactElement | null;
