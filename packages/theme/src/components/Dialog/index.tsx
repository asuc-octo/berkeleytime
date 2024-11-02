import { ComponentProps, forwardRef } from "react";

import * as Primitive from "@radix-ui/react-dialog";
import classNames from "classnames";

import styles from "./Dialog.module.scss";

const Content = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof Primitive.Content>
>(({ className, ...props }, forwardedRef) => {
  return (
    <Primitive.Portal>
      <Primitive.Overlay className={styles.overlay} />
      <Primitive.Content
        {...props}
        ref={forwardedRef}
        className={classNames(styles.content, className)}
      />
    </Primitive.Portal>
  );
});

export const Dialog = {
  Root: Primitive.Root,
  Close: Primitive.Close,
  Title: Primitive.Title,
  Description: Primitive.Description,
  Content,
  Trigger: Primitive.Trigger,
};
