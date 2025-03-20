import { useMemo } from "react";

import { Theme } from "@radix-ui/themes";
import classNames from "classnames";
import { Dialog as Primitive } from "radix-ui";

import { StackContext } from "../../contexts/StackContext";
import { useStack } from "../../hooks/useStack";
import styles from "./Dialog.module.scss";

function Overlay({ className, style, ...props }: Primitive.DialogOverlayProps) {
  const stack = useStack();

  return (
    <Primitive.Overlay
      {...props}
      className={classNames(styles.overlay, className)}
      style={{
        ...style,
        zIndex: stack + 99,
      }}
    />
  );
}

function Content({ className, style, ...props }: Primitive.DialogContentProps) {
  const previousStack = useStack();

  const stack = useMemo(() => previousStack + 100, [previousStack]);

  return (
    <StackContext value={stack}>
      {/* https://github.com/radix-ui/themes/issues/135 */}
      <Theme>
        <Primitive.Content
          {...props}
          className={classNames(styles.content, className)}
          style={{
            ...style,
            zIndex: stack,
          }}
        />
      </Theme>
    </StackContext>
  );
}

function Card({ className, ...props }: Primitive.DialogContentProps) {
  return <Content {...props} className={classNames(styles.card, className)} />;
}

interface DrawerProps {
  align?: "end" | "start";
}

function Drawer({
  className,
  align = "end",
  ...props
}: Omit<Primitive.DialogContentProps, keyof DrawerProps> & DrawerProps) {
  return (
    <Content
      {...props}
      className={classNames(styles.drawer, className)}
      data-align={align}
    />
  );
}

export const Dialog = {
  ...Primitive,
  Overlay,
  Content,
  Card,
  Drawer,
};
