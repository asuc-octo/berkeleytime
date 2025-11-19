import { Skeleton } from "@repo/theme";

import styles from "./Skeleton.module.scss";

export default function ClassCardSkeleton() {
  return <Skeleton className={styles.root} />;
}
