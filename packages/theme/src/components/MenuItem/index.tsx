import { forwardRef } from "react";

import classNames from "classnames";

import type * as Polymorphic from "../../lib/polymorphism";
import styles from "./MenuItem.module.scss";

interface Props {
  active?: boolean;
  disabled?: boolean;
}

type PolymorphicMenuItem = Polymorphic.ForwardRefComponent<"button", Props>;

export const MenuItem = forwardRef(
  (
    {
      active,
      children,
      className,
      disabled,
      as: Component = "button",
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        data-disabled={disabled}
        className={classNames(
          styles.root,
          {
            active,
          },
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
) as PolymorphicMenuItem;

MenuItem.displayName = "MenuItem";
