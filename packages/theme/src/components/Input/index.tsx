import { ComponentPropsWithRef } from "react";

import classNames from "classnames";

import styles from "./Input.module.scss";

export function Input({ className, ...props }: ComponentPropsWithRef<"input">) {
  return <input className={classNames(styles.root, className)} {...props} />;
}
