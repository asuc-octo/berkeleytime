import classNames from "classnames";
import { Check } from "iconoir-react";
import { Checkbox as Primitive } from "radix-ui";

import styles from "./Checkbox.module.scss";

export function Checkbox({ className, ...props }: Primitive.CheckboxProps) {
  return (
    <Primitive.Root className={classNames(styles.root, className)} {...props}>
      <Primitive.Indicator>
        <Check width={12} height={12} />
      </Primitive.Indicator>
    </Primitive.Root>
  );
}
