import { PropsWithChildren, ReactNode } from "react";

import styles from "./ExploreRail.module.scss";

type ExploreRailProps = PropsWithChildren<{
  /** Row heading shown above the carousel */
  title: ReactNode;
}>;

/**
 * Wraps each row: stacked title/description, horizontal carousel band.
 */
export function ExploreRail({ title, children }: ExploreRailProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionHeading}>{title}</h2>
      {children}
    </section>
  );
}
