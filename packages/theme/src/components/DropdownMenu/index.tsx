import classNames from "classnames";
import { DropdownMenu as Primitive } from "radix-ui";

import styles from "./DropdownMenu.module.scss";

function Content({ className, ...props }: Primitive.DropdownMenuContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Content {...props} className={styles.content} />
    </Primitive.Portal>
  );
}

type ItemProps = Primitive.DropdownMenuItemProps & { isDelete?: boolean };

function Item({ className, isDelete = false, ...props }: ItemProps) {
  return (
    <Primitive.Item
      {...props}
      className={classNames(
        styles.item,
        { [styles.delete]: isDelete },
        className
      )}
    />
  );
}

function SubTrigger(props: Primitive.DropdownMenuSubTriggerProps) {
  return (
    <Primitive.SubTrigger
      {...props}
      className={classNames(
        styles.item
      )}
    />
  );
}

function SubContent({ className, ...props }: Primitive.DropdownMenuSubContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.SubContent {...props} className={styles.content} style={{left: 0}}/>
    </Primitive.Portal>
  );
}

export const DropdownMenu = {
  ...Primitive,
  Item,
  Content,
  SubTrigger,
  SubContent
};
