import { ComponentProps, forwardRef } from "react";

import * as Primitive from "@radix-ui/react-dropdown-menu";
import classNames from "classnames";

import styles from "./DropdownMenu.module.scss";

const Content = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof Primitive.Content>
>(({ className, ...props }, forwardedRef) => {
  return (
    <Primitive.Portal>
      <Primitive.Content
        {...props}
        ref={forwardedRef}
        className={classNames(styles.content, className)}
      />
    </Primitive.Portal>
  );
});

const Item = forwardRef<HTMLDivElement, ComponentProps<typeof Primitive.Item>>(
  ({ className, ...props }, forwardedRef) => {
    return (
      <Primitive.Item
        {...props}
        ref={forwardedRef}
        className={classNames(styles.item, className)}
      />
    );
  }
);

export const DropdownMenu = {
  Root: Primitive.Root,
  Label: Primitive.Label,
  Item,
  Group: Primitive.Group,
  CheckboxItem: Primitive.CheckboxItem,
  ItemIndicator: Primitive.ItemIndicator,
  RadioGroup: Primitive.RadioGroup,
  RadioItem: Primitive.RadioItem,
  Separator: Primitive.Separator,
  Arrow: Primitive.Arrow,
  Content,
  Trigger: Primitive.Trigger,
};
