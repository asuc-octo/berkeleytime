import { Switch as Primitive } from "radix-ui";

import styles from "./Switch.module.scss";

export function Switch(props: Primitive.SwitchProps) {
  return (
    <Primitive.Root className={styles.root} {...props}>
      <Primitive.Thumb className={styles.thumb} />
    </Primitive.Root>
  );
}
