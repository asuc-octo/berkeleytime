import { ElementType, ReactElement, ReactNode, forwardRef } from "react";

import classNames from "classnames";

import {
  PolymorphicComponentPropsWithRef,
  PolymorphicRef,
} from "@/lib/polymorphism";

import styles from "./IconButton.module.scss";

interface Props {
  children: ReactNode;
  className?: string;
  invert?: boolean;
  active?: boolean;
}

type IconButtonProps<C extends ElementType> = PolymorphicComponentPropsWithRef<
  C,
  Props
>;

const IconButton = forwardRef(
  <C extends ElementType = "button">(
    { active, children, className, invert, as, ...props }: IconButtonProps<C>,
    ref: PolymorphicRef<C>
  ) => {
    const Component = as || "button";

    return (
      <Component
        className={classNames(
          styles.root,
          {
            [styles.active]: active,
            [styles.invert]: invert,
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
