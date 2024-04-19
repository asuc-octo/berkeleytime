import {
  ComponentPropsWithRef,
  ElementType,
  ReactNode,
  forwardRef,
} from "react";

import classNames from "classnames";

import styles from "./MenuItem.module.scss";

interface MenuItemProps<T = ElementType> {
  active?: boolean;
  children: ReactNode;
  className?: string;
  as?: T;
}

const MenuItem = forwardRef(
  <T extends ElementType = "button">(
    {
      active,
      children,
      className,
      as,
      ...props
    }: MenuItemProps<T> &
      Omit<ComponentPropsWithRef<T>, keyof MenuItemProps<T>>,
    ref: ComponentPropsWithRef<T>["ref"]
  ) => {
    const Component = as ?? "button";

    return (
      <Component
        ref={ref}
        {...props}
        className={classNames(
          styles.root,
          {
            active,
          },
          className
        )}
      >
        {children}
      </Component>
    );
  }
);

MenuItem.displayName = "MenuItem";

export default MenuItem;
