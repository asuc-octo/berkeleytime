import { ComponentPropsWithRef } from "react";

import classNames from "classnames";

import styles from "./Boundary.module.scss";

export function Boundary({
  className,
  ...props
}: ComponentPropsWithRef<"div">) {
  return <div {...props} className={classNames(styles.root, className)} />;
}
