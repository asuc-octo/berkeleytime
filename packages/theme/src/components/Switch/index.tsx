import { Switch as Primitive } from "radix-ui";

import styles from "./Switch.module.scss";

export function Switch() {
  return (
    <Primitive.Root className={styles.root}>
      <Primitive.Thumb className={styles.thumb} />
    </Primitive.Root>
  );
}
