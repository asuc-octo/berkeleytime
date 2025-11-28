import { ArrowUpRight, MessageText } from "iconoir-react";

import styles from "./Banner.module.scss";

export default function Banner() {
  return (
    <div className={styles.root}>
      <p className={styles.text}>
        You are viewing a beta release of Berkeleytime.
      </p>
      <div className={styles.actions}>
        <a className={styles.link} href="https://berkeleytime.com">
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
