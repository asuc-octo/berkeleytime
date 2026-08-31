import { PropsWithChildren, ReactNode } from "react";

import styles from "./ExploreRail.module.scss";

type ExploreRailProps = PropsWithChildren<{
  title: ReactNode;
}>;

export function ExploreRail({ title, children }: ExploreRailProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionHeading}>{title}</h2>
      {children}
    </section>
  );
}
