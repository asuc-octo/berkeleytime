/**
 * Enables polymorphic React components in TypeScript
 * https://benmvp.com/blog/forwarding-refs-polymorphic-react-component-typescript
 */
import {
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  ElementType,
  JSXElementConstructor,
} from "react";

export type PropsOf<
  C extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>,
> = JSX.LibraryManagedAttributes<C, ComponentPropsWithoutRef<C>>;

type AsProp<C extends ElementType> = {
  as?: C;
};

export type ExtendableProps<
  ExtendedProps = {},
  OverrideProps = {},
> = OverrideProps & Omit<ExtendedProps, keyof OverrideProps>;

export type InheritableElementProps<
  C extends ElementType,
  Props = {},
> = ExtendableProps<PropsOf<C>, Props>;

export type PolymorphicComponentProps<
  C extends ElementType,
  Props = {},
> = InheritableElementProps<C, Props & AsProp<C>>;

export type PolymorphicRef<C extends ElementType> =
  ComponentPropsWithRef<C>["ref"];

export type PolymorphicComponentPropsWithRef<
  C extends ElementType,
  Props = {},
> = PolymorphicComponentProps<C, Props> & { ref?: PolymorphicRef<C> };