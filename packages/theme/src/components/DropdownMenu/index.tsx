import classNames from "classnames";
import { DropdownMenu as Primitive } from "radix-ui";

import styles from "./DropdownMenu.module.scss";

function Content({ className, ...props }: Primitive.DropdownMenuContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        {...props}
        className={classNames(styles.content, className)}
      />
    </Primitive.Portal>
  );
}

function Item({ className, ...props }: Primitive.DropdownMenuItemProps) {
  return (
    <Primitive.Item {...props} className={classNames(styles.item, className)} />
  );
}

export const DropdownMenu = {
  ...Primitive,
  Item,
  Content,
};
