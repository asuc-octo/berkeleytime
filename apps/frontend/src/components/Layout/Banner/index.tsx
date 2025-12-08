import classNames from "classnames";
import { ArrowUpRight, MessageText } from "iconoir-react";

import styles from "./Banner.module.scss";

interface BannerProps {
  transparent?: boolean;
}

export default function Banner({ transparent }: BannerProps) {
  return (
    <div className={classNames(styles.root, { [styles.transparent]: transparent })}>
      <p className={styles.text}>
        You are viewing a beta release of Berkeleytime.
      </p>
      <div className={styles.actions}>
        <a
          className={`${styles.link} ${styles.returnLink}`}
          href="https://berkeleytime.com"
        >
          <div className={styles.text}>Return to Berkeleytime</div>
          <ArrowUpRight height={12} width={12} />
        </a>
        <a
          className={styles.link}
          href="https://forms.gle/zeAUQAHrMcrRJyhK6"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className={styles.text}>Provide Feedback</div>
          <MessageText height={12} width={12} />
        </a>
      </div>
    </div>
  );
}
