import { useState } from "react";

import { MessageText, Xmark } from "iconoir-react";

import styles from "./BetaBanner.module.scss";

export default function BetaBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.root}>
      <p className={styles.text}>
        You are viewing the <i>new</i> release of Berkeleytime.
      </p>
      <div className={styles.actions}>
        <a
          className={styles.link}
          href="https://forms.gle/zeAUQAHrMcrRJyhK6"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className={styles.text}>Provide Feedback</div>
          <MessageText height={12} width={12} />
        </a>
        <button
          type="button"
          className={styles.closeButton}
          onClick={() => setIsVisible(false)}
          aria-label="Close banner"
        >
          <Xmark />
        </button>
      </div>
    </div>
  );
}
