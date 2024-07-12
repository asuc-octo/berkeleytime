import { ElementType, ReactElement, ReactNode, forwardRef } from "react";

import classNames from "classnames";

import {
  PolymorphicComponentPropsWithRef,
  PolymorphicRef,
} from "@/lib/polymorphism";

import styles from "./MenuItem.module.scss";

interface Props {
  active?: boolean;
  children: ReactNode;
  className?: string;
}

type MenuItemProps<C extends ElementType> = PolymorphicComponentPropsWithRef<
  C,
  Props
>;

const MenuItem = forwardRef(
  <T extends ElementType = "button">(
    { active, children, className, as, ...props }: MenuItemProps<T>,
    ref: PolymorphicRef<T>
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

export default MenuItem as <T extends ElementType = "button">(
  props: MenuItemProps<T>
) => ReactElement | null;
