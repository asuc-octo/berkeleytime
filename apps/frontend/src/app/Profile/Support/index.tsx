import { Text } from "@repo/theme";

// eslint-disable-next-line css-modules/no-unused-class
import profileStyles from "../Profile.module.scss";
import styles from "./Support.module.scss";

export default function Support() {
  return (
    <div className={profileStyles.contentInner}>
      <h1 className={profileStyles.pageTitle}>Support</h1>
      <div className={profileStyles.pageContent}>
        <Text size="3" style={{ lineHeight: 1.6 }}>
          Thank you for beta testing our website! To leave us feedback,{" "}
          <a
            href="https://forms.gle/zeAUQAHrMcrRJyhK6"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            fill out this form
          </a>{" "}
          or email us at{" "}
          <a href="mailto:octo.berkeleytime@asuc.org" className={styles.link}>
            octo.berkeleytime@asuc.org
          </a>
          .
        </Text>
      </div>
    </div>
  );
}
