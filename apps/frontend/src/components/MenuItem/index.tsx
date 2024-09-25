import { ElementType, ReactNode, forwardRef } from "react";

import classNames from "classnames";

import {
  PolymorphicComponentPropsWithRef,
  PolymorphicRef,
} from "@/lib/polymorphism";

import styles from "./MenuItem.module.scss";

interface Props {
  active?: boolean;
  disabled?: boolean;
}

type MenuItemProps<C extends ElementType> = PolymorphicComponentPropsWithRef<
  C,
  Props
>;

const MenuItem = forwardRef(
  <C extends ElementType = "button">(
    { active, children, className, disabled, as, ...props }: MenuItemProps<C>,
    ref: PolymorphicRef<C>
  ) => {
    const Component = as || "button";

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
);

MenuItem.displayName = "MenuItem";

export default MenuItem as <T extends ElementType = "button">(
  props: MenuItemProps<T>
) => ReactNode | null;
