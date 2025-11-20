import { ComponentPropsWithRef } from "react";

import classNames from "classnames";

import styles from "./Skeleton.module.scss";

export type SkeletonProps = ComponentPropsWithRef<"span">;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <span className={classNames(styles.root, className)} {...props} />;
}
