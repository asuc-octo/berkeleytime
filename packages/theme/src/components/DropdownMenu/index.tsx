import classNames from "classnames";
import { DropdownMenu as Primitive } from "radix-ui";

import {
  DropdownLayerVariant,
  getDropdownLayerZIndexCssVar,
} from "../../layers";
import styles from "./DropdownMenu.module.scss";

type ContentProps = Primitive.DropdownMenuContentProps & {
  forceTheme?: "light" | "dark";
  layer?: DropdownLayerVariant;
};

function Content({
  className,
  forceTheme,
  layer = "topPopover",
  style,
  ...props
}: ContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        {...props}
        data-theme={forceTheme}
        className={classNames(styles.content, className)}
        style={{
          ...style,
          zIndex: style?.zIndex ?? getDropdownLayerZIndexCssVar(layer),
        }}
      />
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
    <Primitive.SubTrigger {...props} className={classNames(styles.item)} />
  );
}

function SubContent({
  className,
  layer = "topPopover",
  style,
  ...props
}: Primitive.DropdownMenuSubContentProps & { layer?: DropdownLayerVariant }) {
  return (
    <Primitive.Portal>
      <Primitive.SubContent
        {...props}
        className={classNames(styles.content, className)}
        style={{
          ...style,
          left: 0,
          zIndex: style?.zIndex ?? getDropdownLayerZIndexCssVar(layer),
        }}
      />
    </Primitive.Portal>
  );
}

export const DropdownMenu = {
  ...Primitive,
  Item,
  Content,
  SubTrigger,
  SubContent,
};
