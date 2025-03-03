import classNames from "classnames";
import { AlertDialog as Primitive } from "radix-ui";

import styles from "./Dialog.module.scss";

// TODO: AlertDialogContent should be a separate component
function Content({ className, ...props }: Primitive.AlertDialogContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay className={styles.overlay} />
      <Primitive.Content
        {...props}
        className={classNames(styles.content, className)}
      />
    </Primitive.Portal>
  );
}

export const Dialog = {
  ...Primitive,
  Content,
};
