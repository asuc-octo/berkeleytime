import {
  ComponentProps,
  ComponentPropsWithRef,
  ElementType,
  ReactNode,
} from "react";

import classNames from "classnames";

import styles from "./Text.module.scss";

const getTitleCase = (value?: string) => {
  if (!value) return;

  return value[0].toUpperCase() + value.slice(1).toLowerCase();
};

interface TextProps<T> {
  children: ReactNode;
  variant?: "feature";
  as?: T;
  weight?: "regular" | "medium" | "bold";
  align?: "left" | "center" | "right";
  size?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
}

export function Text<T extends ElementType = "p">({
  as,
  size = "2",
  weight = "regular",
  variant,
  align,
  className,
  ...props
}: TextProps<T> & Omit<ComponentPropsWithRef<T>, keyof TextProps<T>>) {
  const Component = as || "p";

  return (
    <Component
      className={classNames(
        styles.text,
        {
          [styles[`size${getTitleCase(size)}`]]: size,
          [styles[`variant${getTitleCase(variant)}`]]: variant,
          [styles[`weight${getTitleCase(weight)}`]]: weight,
          [styles[`align${getTitleCase(align)}`]]: align,
        },
        className
      )}
      {...props}
    />
  );
}

export function Heading<T extends ElementType = "p">({
  weight = "medium",
  className,
  ...props
}: TextProps<T> & Omit<ComponentPropsWithRef<T>, keyof TextProps<T>>) {
  return (
    // @ts-expect-error - Unknown issue with proxying `as` prop
    <Text
      className={classNames(styles.heading, className)}
      weight={weight}
      {...props}
    />
  );
}

export function Label<T extends ElementType = "p">({
  className,
  size = "1",
  ...props
}: TextProps<T> & Omit<ComponentProps<T>, keyof TextProps<T>>) {
  return (
    // @ts-expect-error - Unknown issue with proxying `as` prop
    <Text
      className={classNames(styles.label, className)}
      size={size}
      {...props}
    />
  );
}
