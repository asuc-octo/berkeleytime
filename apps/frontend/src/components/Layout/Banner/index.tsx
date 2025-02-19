import { ArrowUpRight } from "iconoir-react";

import styles from "./Banner.module.scss";

export default function Banner() {
  return (
    <a className={styles.root} href="https://berkeleytime.com">
      <p className={styles.text}>
        You are viewing a beta release of Berkeleytime.
      </p>
      <div className={styles.group}>
        <div className={styles.text}>Return to Berkeleytime</div>
        <ArrowUpRight height={12} width={12} />
      </div>
    </a>
  );
}
